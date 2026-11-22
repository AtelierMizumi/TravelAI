import test from 'node:test';
import assert from 'node:assert/strict';
import { historySummary, bookingStatus } from '../src/services/booking-history.ts';
test('history only displays approved readable fields', () => {
  const result = historySummary('CANCELLED', { refund: 2730000, fee: 1470000, sourceAccountId: 'private-account', reviewed: { secret: 'private' } });
  assert.match(result, /2\.730\.000/);
  assert.match(result, /1\.470\.000/);
  assert.doesNotMatch(result, /private|sourceAccountId|reviewed|\{/);
  assert.equal(bookingStatus('CANCELLED'), 'Đã hủy');
});
test('legacy or missing details do not produce JSON or crash', () => {
  assert.match(historySummary('CONFIRMED', null), /xác nhận/);
  assert.match(historySummary('UNKNOWN', 'raw payload'), /cập nhật/);
});
