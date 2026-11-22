import test from 'node:test';
import assert from 'node:assert/strict';
import { heartReactionFrame } from '../src/services/heart-reaction.ts';

test('a reaction jumps upward, returns to rest and its floating heart disappears', () => {
  const start = heartReactionFrame(0, false);
  const peak = heartReactionFrame(0.25, false);
  const end = heartReactionFrame(1, false);
  assert.equal(start.translateY, 0);
  assert.equal(start.scale, 1);
  assert.ok(peak.translateY < -5);
  assert.ok(peak.scale > 1.2);
  assert.ok(peak.floatY < 0);
  assert.ok(peak.opacity > 0);
  assert.equal(end.translateY, 0);
  assert.equal(end.scale, 1);
  assert.equal(end.opacity, 0);
});

test('reduced motion keeps the button still and hides decorative hearts throughout', () => {
  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    const frame = heartReactionFrame(progress, true);
    assert.equal(frame.translateY, 0);
    assert.equal(frame.scale, 1);
    assert.equal(frame.opacity, 0);
  }
});
