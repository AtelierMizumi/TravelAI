#!/usr/bin/env python3
"""Download the pinned team model and verify its SHA-256 before installation."""
import hashlib
import os
import tempfile
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[1]
dest = root / 'ai-service/models/landmark_classifier.onnx'
url = 'https://raw.githubusercontent.com/Duchayslay/TravelAI/2425d01850ed33a147fa6f4185f0a6492b17b872/services/ai/app/models/landmark_classifier.onnx'
expected = 'b3e69b571a0c2c7943e0d4e68f2e5b3fae51df5b612535f7fa57cd8d47f058cc'
dest.parent.mkdir(parents=True, exist_ok=True)
fd, name = tempfile.mkstemp(prefix='.model-', dir=dest.parent)
try:
    digest = hashlib.sha256()
    with os.fdopen(fd, 'wb') as out, urllib.request.urlopen(url, timeout=90) as response:
        while block := response.read(1024 * 1024):
            digest.update(block)
            out.write(block)
    if digest.hexdigest() != expected:
        raise SystemExit('Model SHA-256 không khớp; không cài tệp đã tải.')
    os.replace(name, dest)
    print(f'Model đã được xác minh: {dest}')
finally:
    if os.path.exists(name): os.unlink(name)
