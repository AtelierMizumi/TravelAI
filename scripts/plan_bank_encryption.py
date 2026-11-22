#!/usr/bin/env python3
"""Prepare a private reviewable SQL plan, never apply it. Stop writers and back up before approval/apply."""
import argparse,base64,hashlib,hmac,json,os,secrets,subprocess
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT=Path(__file__).resolve().parents[1]
def sql_string(value): return "'"+value.replace("'","''")+"'"
def build(rows,key):
    encryption=hmac.new(key,b'travelai:bank:encryption:v1',hashlib.sha256).digest()
    verifier=hmac.new(key,b'travelai:bank:verification:v1',hashlib.sha256).digest()
    lines=['BEGIN;','LOCK TABLE simulated_cards IN ACCESS EXCLUSIVE MODE;',
           'ALTER TABLE simulated_cards ADD COLUMN IF NOT EXISTS encrypted_synthetic_id text;',
           'ALTER TABLE simulated_cards ADD COLUMN IF NOT EXISTS identifier_lookup varchar(64);',
           'CREATE UNIQUE INDEX IF NOT EXISTS simulated_card_identifier_lookup ON simulated_cards(identifier_lookup);']
    count=0
    for row in rows:
        identifier=row['synthetic_id']; card_id=row['id']
        if row.get('encrypted_synthetic_id') or not identifier.startswith('SIM-MC-'): continue
        nonce=secrets.token_bytes(12)
        encrypted=base64.b64encode(nonce+AESGCM(encryption).encrypt(nonce,identifier.encode(),f'travelai:bank:identifier:v1:{card_id}'.encode())).decode()
        lookup=hmac.new(verifier,('identifier:'+identifier).encode(),hashlib.sha256).hexdigest()
        tag='$bank_'+secrets.token_hex(12)+'$'
        while tag in card_id+identifier:
            tag='$bank_'+secrets.token_hex(12)+'$'
        lines.append("DO $bankplan$ BEGIN UPDATE simulated_cards SET encrypted_synthetic_id="+sql_string(encrypted)+", identifier_lookup="+sql_string(lookup)+", synthetic_id="+sql_string('SIM-MC-ENC-'+card_id)+" WHERE id="+sql_string(card_id)+" AND synthetic_id="+sql_string(identifier)+"; IF NOT FOUND THEN RAISE EXCEPTION 'Bank row changed since plan preparation'; END IF; END $bankplan$;")
        lines[-1]=lines[-1].replace("$bankplan$",tag)
        count+=1
    # One-time provisioning must not retain duplicate plain account identifiers or codes.
    lines.append("UPDATE booking_operations SET result=((result::jsonb)-'cardId'-'testCvv')::text WHERE action='PROVISION';")
    lines.append('COMMIT;')
    return '\n'.join(lines)+'\n',count
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--database',default='travel_ai');parser.add_argument('--port',default='5432')
    parser.add_argument('--user',default='postgres');parser.add_argument('--output',required=True)
    args=parser.parse_args()
    env=os.environ.copy();env['PGCONNECT_TIMEOUT']='5'
    query="select coalesce(json_agg(json_build_object('id',id,'synthetic_id',synthetic_id,'encrypted_synthetic_id',to_jsonb(simulated_cards)->>'encrypted_synthetic_id')),'[]') from simulated_cards;"
    proc=subprocess.run(['psql','-X','-q','-w','-h','127.0.0.1','-p',args.port,'-U',args.user,'-d',args.database,'-At','-v','ON_ERROR_STOP=1','-c',query],capture_output=True,text=True,env=env)
    if proc.returncode: raise SystemExit('Cannot read bank rows; no data changed.')
    keyfile=Path(os.environ.get('TRAVELAI_BANK_KEY_FILE') or os.environ.get('TRAVELAI_MESSAGE_KEY_FILE') or ROOT/'backend/.secrets/message.key')
    encoded=os.environ.get('TRAVELAI_BANK_KEY') or os.environ.get('TRAVELAI_MESSAGE_KEY') or keyfile.read_text().strip()
    key=base64.b64decode(encoded,validate=True)
    if len(key)!=32: raise SystemExit('Original 32-byte key required; no data changed.')
    text,count=build(json.loads(proc.stdout),key)
    target=Path(args.output);target.parent.mkdir(parents=True,exist_ok=True,mode=0o700)
    fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,'w') as stream:stream.write(text)
    print(json.dumps({'planned_cards':count,'sha256':hashlib.sha256(text.encode()).hexdigest(),'applied':False}))
