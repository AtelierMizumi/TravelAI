import test from 'node:test';
import assert from 'node:assert/strict';
import { monthDays, isoDay, validStay } from '../src/services/calendar.ts';

test('leap February has 29 valid days and Monday-first offset', () => {
  const cells = monthDays(2028, 1);
  assert.equal(cells.filter(Boolean).length, 29);
  assert.equal(cells.indexOf(1), 1);
  assert.equal(isoDay(2028, 1, 29), '2028-02-29');
});
test('year boundaries preserve date-only booking values', () => {
  assert.equal(isoDay(2026, 11, 31), '2026-12-31');
  assert.equal(isoDay(2027, 0, 1), '2027-01-01');
});
test('a stay must contain real dates with checkout strictly after checkin', () => {
  assert.equal(validStay('2026-12-31','2027-01-01'), true);
  for (const [a,b] of [['2026-02-30','2026-03-02'],['2026-12-31','2026-12-31'],['2026-12-31','2026-12-30'],['','2026-12-31']]) assert.equal(validStay(a,b),false);
});
