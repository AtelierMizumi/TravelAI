import test from 'node:test';
import assert from 'node:assert/strict';
import { nextSlide, horizontalDrag } from '../src/services/depth-motion.ts';
test('drag only changes destination for deliberate horizontal movement', () => {
 assert.equal(horizontalDrag(8, 1), false);
 assert.equal(horizontalDrag(25, 70), false);
 assert.equal(horizontalDrag(-70, 10), true);
 assert.equal(nextSlide(0, 1, 3), 1);
 assert.equal(nextSlide(0, -1, 3), 2);
 assert.equal(nextSlide(2, 1, 3), 0);
 assert.equal(nextSlide(0, 1, 0), 0);
});
test('vertical and small diagonal gestures never claim the horizontal destination deck', () => {
 for (const [dx, dy] of [[0, 100], [25, 70], [15, 0], [30, 30], [-20, -80]]) {
  assert.equal(horizontalDrag(dx, dy), false);
 }
});

test('explicit destination controls handle empty, single-item and wraparound catalogues', () => {
 assert.equal(nextSlide(0, -1, 0), 0);
 assert.equal(nextSlide(0, 1, 1), 0);
 assert.equal(nextSlide(0, -1, 3), 2);
 assert.equal(nextSlide(2, 1, 3), 0);
});
