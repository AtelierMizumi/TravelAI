#!/usr/bin/env bash
# Idempotently create production secrets in the current directory:
#   secrets/message.key (32 random bytes, base64) and .env entries POSTGRES_PASSWORD, HOST_MESSAGE_KEY.
# Never overwrites an existing value and never prints a secret.
set -euo pipefail
umask 077
mkdir -p secrets
chmod 700 secrets
touch .env
chmod 600 .env

if [ ! -s secrets/message.key ]; then
  openssl rand -base64 32 > secrets/message.key
  echo "created secrets/message.key"
fi
chmod 600 secrets/message.key

set_default() { # name value
  if ! grep -q "^$1=" .env; then
    printf '%s=%s\n' "$1" "$2" >> .env
    echo "set $1 in .env"
  fi
}
set_default POSTGRES_PASSWORD "$(openssl rand -base64 36 | tr -d '/+=\n')"
set_default HOST_MESSAGE_KEY "$PWD/secrets/message.key"
