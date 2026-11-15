import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { adminAccess } from '../src/context/authGuard.ts';

test('admin screen keeps loading gate before checking user', () => {
  assert.equal(adminAccess({ user: null, loading: true }), 'loading');
  assert.equal(adminAccess({ user: null, loading: false }), 'denied');
  assert.equal(adminAccess({ user: { role: 'USER' }, loading: false }), 'denied');
  assert.equal(adminAccess({ user: { role: 'ADMIN' }, loading: false }), 'allowed');
});
