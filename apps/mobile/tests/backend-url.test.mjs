import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBackendUrl } from '../src/services/backend-url.ts';

test('explicit backend is used on an Expo tunnel without deriving port 8080 from the tunnel host', () => {
  assert.equal(resolveBackendUrl({ configured: ' http://192.168.1.10:8080/api/ ', expoHost: 'demo.exp.direct:80' }), 'http://192.168.1.10:8080/api');
});
test('native LAN host retains its hostname and uses the backend port', () => {
  assert.equal(resolveBackendUrl({ expoHost: '172.26.24.81:8084' }), 'http://172.26.24.81:8080/api');
});
test('an Expo tunnel without a configured backend fails immediately with an actionable configuration error', () => {
  assert.throws(() => resolveBackendUrl({ expoHost: 'demo.exp.direct:80' }), /EXPO_PUBLIC_API_URL/);
});
test('local web continues to use the browser host', () => {
  assert.equal(resolveBackendUrl({ webOrigin: 'http://localhost:8084' }), 'http://localhost:8080/api');
});
test('remote HTTPS web cannot accidentally send credentials to a guessed port', () => {
  assert.throws(() => resolveBackendUrl({ webOrigin: 'https://demo.exp.direct' }), /EXPO_PUBLIC_API_URL/);
});

test('a public hostname beginning with a private-looking number is not a LAN address', () => {
  assert.throws(() => resolveBackendUrl({ expoHost: '10.example.com:8084' }), /EXPO_PUBLIC_API_URL/);
});
