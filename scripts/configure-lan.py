#!/usr/bin/env python3
"""Choose the current LAN API endpoint and update only the local Expo setting."""
import os
from pathlib import Path
import re
import socket
import sys
from urllib.parse import urlsplit


def lan_address():
    # UDP connect selects a route without transmitting data or requiring an external service.
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.connect(('192.0.2.1', 9))
        address = sock.getsockname()[0]
    if address.startswith('127.') or address == '0.0.0.0':
        raise RuntimeError('Không tìm thấy IP LAN. Kết nối Wi-Fi hoặc đặt EXPO_PUBLIC_API_URL.')
    return address


def configure(path, api):
    url = urlsplit(api)
    if url.scheme not in ('http', 'https') or not url.hostname or url.username or url.password:
        raise ValueError('EXPO_PUBLIC_API_URL phải là URL HTTP/HTTPS, không chứa mật khẩu.')
    if url.query or url.fragment or url.path.rstrip('/') != '/api':
        raise ValueError('EXPO_PUBLIC_API_URL cần kết thúc bằng /api, không có query hoặc fragment.')
    value = api.rstrip('/')
    text = path.read_text() if path.exists() else ''
    line = f'EXPO_PUBLIC_API_URL={value}'
    if re.search(r'^EXPO_PUBLIC_API_URL=', text, re.M):
        text = re.sub(r'^EXPO_PUBLIC_API_URL=.*$', line, text, flags=re.M)
    else:
        text = text.rstrip() + '\n' + line + '\n'
    path.write_text(text.lstrip('\n'))
    return value


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    try:
        api = os.environ.get('EXPO_PUBLIC_API_URL') or f'http://{lan_address()}:8080/api'
        print(configure(root / 'apps/mobile/.env.local', api))
    except (OSError, ValueError, RuntimeError) as error:
        print(f'Không cấu hình được kết nối LAN: {error}', file=sys.stderr)
        raise SystemExit(1)
