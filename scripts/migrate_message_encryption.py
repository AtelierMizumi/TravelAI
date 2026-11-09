#!/usr/bin/env python3
"""Back up PostgreSQL and encrypt legacy chat messages atomically.

Run with --apply while application writers are stopped. Data and keys are never printed.
"""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = Path(__file__).resolve().parents[1]
KEY_PATH = Path(os.environ.get("TRAVELAI_MESSAGE_KEY_FILE", ROOT / "backend/.secrets/message.key")).expanduser().resolve()
BACKUP_DIR = Path(os.environ.get("TRAVELAI_BACKUP_DIR", ROOT / ".local-backups")).expanduser().resolve()


def connection():
    properties = {}
    for line in (ROOT / "backend/src/main/resources/application.properties").read_text().splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            name, value = line.split("=", 1)
            properties[name.strip()] = value.strip()
    url = os.environ.get("SPRING_DATASOURCE_URL", properties.get("spring.datasource.url", ""))
    match = re.fullmatch(r"jdbc:postgresql://([^/:?]+)(?::(\d+))?/([^?]+)(?:\?.*)?", url)
    if not match:
        raise RuntimeError("Unsupported datasource URL; supply SPRING_DATASOURCE_URL")
    environment = os.environ.copy()
    environment["PGPASSWORD"] = os.environ.get("SPRING_DATASOURCE_PASSWORD", properties.get("spring.datasource.password", ""))
    environment["PGCONNECT_TIMEOUT"] = "5"
    environment["PGCLIENTENCODING"] = "UTF8"
    args = ["-h", match[1], "-p", match[2] or "5432", "-U", os.environ.get("SPRING_DATASOURCE_USERNAME", properties.get("spring.datasource.username", "")), "-d", match[3]]
    return args, environment


def psql(args, env, sql):
    result = subprocess.run(["psql", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", *args, "-c", sql], env=env, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError("PostgreSQL query failed; check connection and database permissions")
    return result.stdout.strip()


def load_or_create_key(encrypted_rows):
    KEY_PATH.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    if not KEY_PATH.exists():
        if encrypted_rows:
            raise RuntimeError("Existing encrypted messages require their original key file")
        try:
            fd = os.open(KEY_PATH, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(fd, "w", encoding="ascii") as output:
                output.write(base64.b64encode(secrets.token_bytes(32)).decode("ascii") + "\n")
        except FileExistsError:
            pass
    if KEY_PATH.stat().st_mode & 0o077:
        raise RuntimeError("Message key file must only be accessible by its owner")
    key = base64.b64decode(KEY_PATH.read_text(encoding="ascii").strip(), validate=True)
    if len(key) != 32:
        raise RuntimeError("Message key must contain 32 base64-encoded bytes")
    return key


def encrypted_backup(args, env):
    BACKUP_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    os.chmod(BACKUP_DIR, 0o700)
    target = BACKUP_DIR / ("travelai-before-migration-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + secrets.token_hex(4) + ".dump.gpg")
    common = ["gpg", "--batch", "--no-options", "--pinentry-mode", "loopback", "--passphrase-file", str(KEY_PATH)]
    with tempfile.TemporaryDirectory(prefix="travelai-gpg-", dir=BACKUP_DIR) as home:
        secured_env = env.copy()
        secured_env["GNUPGHOME"] = home
        old_umask = os.umask(0o077)
        try:
            dump = subprocess.Popen(["pg_dump", "--format=custom", "--no-owner", "--no-acl", *args], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            encrypt = subprocess.run([*common, "--cipher-algo", "AES256", "--symmetric", "--output", str(target)], env=secured_env, stdin=dump.stdout, capture_output=True)
            dump.stdout.close()
            dump_error = dump.stderr.read()
            dump_code = dump.wait()
            if dump_code or encrypt.returncode:
                target.unlink(missing_ok=True)
                raise RuntimeError("Encrypted database backup failed")
            decrypt = subprocess.Popen([*common, "--decrypt", str(target)], env=secured_env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            verify = subprocess.run(["pg_restore", "--file", os.devnull], stdin=decrypt.stdout, capture_output=True)
            decrypt.stdout.close()
            decrypt_error = decrypt.stderr.read()
            decrypt_code = decrypt.wait()
            if decrypt_code or verify.returncode:
                target.unlink(missing_ok=True)
                raise RuntimeError("Encrypted database backup verification failed")
        finally:
            os.umask(old_umask)
    return target


def apply_schema(args, env):
    for name in ("001_simulated_booking.sql", "002_multiplatform_chat.sql", "004_notification_reference.sql", "005_service_ratings.sql", "006_hotel_province.sql", "007_simulated_payment_attempts.sql", "008_profile_images.sql", "009_password_reset.sql", "010_password_reset_verification.sql"):
        path = ROOT / "backend/src/main/resources/db" / name
        result = subprocess.run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", *args, "-f", str(path)], env=env, capture_output=True)
        if result.returncode:
            raise RuntimeError(f"Schema migration failed: {name}; encrypted backup retained")


def migrate_messages(args, env, key):
    process = subprocess.Popen(["psql", "-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", *args], env=env, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
    try:
        process.stdin.write("BEGIN; SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='60s'; LOCK TABLE chat_messages IN ACCESS EXCLUSIVE MODE; ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS content_encryption varchar(32); SELECT json_build_array(id,sender_id,receiver_id,content,content_encryption)::text FROM chat_messages WHERE content IS NOT NULL ORDER BY id; SELECT '__TRAVELAI_END_ROWS__';\n")
        process.stdin.flush()
        rows = []
        for line in process.stdout:
            if line.strip() == "__TRAVELAI_END_ROWS__":
                break
            if line.strip():
                rows.append(json.loads(line))
        else:
            raise RuntimeError("Cannot read chat records; migration rolled back")
        cipher = AESGCM(key)
        updates = []
        for record_id, sender, receiver, content, encoding in rows:
            aad = f"travelai-chat:v1:{sender if sender is not None else 'null'}:{receiver if receiver is not None else 'null'}".encode()
            if encoding is None:
                nonce = secrets.token_bytes(12)
                value = base64.b64encode(nonce + cipher.encrypt(nonce, content.encode('utf-8'), aad)).decode('ascii')
                updates.append((int(record_id), value))
            elif encoding == 'AES256_GCM_V1':
                data = base64.b64decode(content, validate=True)
                cipher.decrypt(data[:12], data[12:], aad)
            else:
                raise RuntimeError("Unknown message encryption version; migration rolled back")
        for record_id, value in updates:
            process.stdin.write(f"UPDATE chat_messages SET content='{value}', content_encryption='AES256_GCM_V1' WHERE id={record_id} AND content_encryption IS NULL;\n")
        process.stdin.write("SELECT '__TRAVELAI_REMAINING__:' || count(*) FROM chat_messages WHERE content IS NOT NULL AND content_encryption IS NULL;\n")
        process.stdin.flush()
        remaining = None
        for line in process.stdout:
            if line.startswith("__TRAVELAI_REMAINING__:"):
                remaining = int(line.strip().split(":", 1)[1])
                break
        if remaining != 0:
            raise RuntimeError("Message verification failed; migration rolled back")
        process.stdin.write("COMMIT; SELECT '__TRAVELAI_COMMITTED__';\n")
        process.stdin.flush()
        committed = any(line.strip() == "__TRAVELAI_COMMITTED__" for line in process.stdout)
        process.stdin.close()
        if process.wait() or not committed:
            raise RuntimeError("Message migration could not be confirmed")
        return len(rows), len(updates)
    except Exception:
        process.kill()
        process.wait()
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Create a protected backup and apply the migration")
    args = parser.parse_args()
    db_args, env = connection()
    table = psql(db_args, env, "select to_regclass('public.chat_messages') is not null")
    if table != 't':
        raise RuntimeError("The existing chat_messages table was not found")
    column = psql(db_args, env, "select exists(select 1 from information_schema.columns where table_schema='public' and table_name='chat_messages' and column_name='content_encryption')")
    encrypted = int(psql(db_args, env, "select count(*) from chat_messages where content_encryption is not null")) if column == 't' else 0
    total = int(psql(db_args, env, "select count(*) from chat_messages where content is not null"))
    if not args.apply:
        print(f"Chat rows with content: {total}. Already marked encrypted: {encrypted}.")
        return
    key = load_or_create_key(encrypted)
    backup = encrypted_backup(db_args, env)
    apply_schema(db_args, env)
    total, changed = migrate_messages(db_args, env, key)
    print(f"Encrypted backup created and verified: {backup}")
    print(f"Chat rows verified: {total}. Newly encrypted: {changed}.")
    print(f"Message key file: {KEY_PATH}")


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f"Migration stopped: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
