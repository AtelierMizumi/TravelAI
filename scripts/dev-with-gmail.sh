#!/usr/bin/env bash
set -euo pipefail

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mode=${1:-web}
if [[ "$mode" != web && "$mode" != app ]]; then
  printf 'Sử dụng: bash scripts/dev-with-gmail.sh [web|app]\n' >&2
  exit 2
fi

# An already-running backend cannot inherit the SMTP settings entered below.
if python3 - <<'PY'
import socket
with socket.socket() as connection:
    connection.settimeout(0.5)
    raise SystemExit(connection.connect_ex(('127.0.0.1', 8080)) != 0)
PY
then
  printf 'Backend đang chạy trên cổng 8080. Hãy dừng backend đó trước khi cấu hình Gmail.\n' >&2
  exit 1
fi

read -r -p 'Gmail gửi thư: ' TRAVELAI_SMTP_USERNAME
read -r -s -p 'Mật khẩu ứng dụng Gmail (không hiện khi gõ): ' TRAVELAI_SMTP_PASSWORD
printf '\n'
TRAVELAI_SMTP_PASSWORD=${TRAVELAI_SMTP_PASSWORD// /}
if [[ -z "$TRAVELAI_SMTP_USERNAME" || -z "$TRAVELAI_SMTP_PASSWORD" ]]; then
  printf 'Cần nhập Gmail gửi thư và mật khẩu ứng dụng.\n' >&2
  exit 1
fi
export TRAVELAI_SMTP_USERNAME TRAVELAI_SMTP_PASSWORD
printf 'Đang kiểm tra đăng nhập Gmail, không gửi thư…\n'
python3 "$project_root/scripts/check_smtp.py"

umask 077
key_dir="$project_root/backend/.secrets"
key_file="$key_dir/password-reset.key"
mkdir -p "$key_dir"
if [[ ! -e "$key_file" ]]; then
  (set -o noclobber; openssl rand -base64 32 > "$key_file")
fi
if [[ ! -s "$key_file" ]]; then
  printf 'Khóa khôi phục đang rỗng. Hãy kiểm tra %s.\n' "$key_file" >&2
  exit 1
fi
export TRAVELAI_RESET_SECRET="$(<"$key_file")"
cd "$project_root"
exec bash scripts/dev.sh "$mode"
