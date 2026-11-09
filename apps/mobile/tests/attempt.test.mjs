import test from "node:test";
import assert from "node:assert/strict";
import { operationAttempt } from "../src/services/attempt.ts";

test("unknown payment result retries with its original operation key", () => {
  const input = {
    digest: "synthetic-review",
    confirmed: true,
    cardId: "SIM-MC-fixture",
  };
  const first = operationAttempt(null, input, () => "synthetic-operation-1");
  const retry = operationAttempt(first, { ...input }, () => {
    throw new Error("Must not issue a new key");
  });
  assert.equal(retry, first);
});
test("changed review confirmation gets a different key", () => {
  const first = operationAttempt(
    null,
    { digest: "old-review" },
    () => "synthetic-operation-1",
  );
  const next = operationAttempt(
    first,
    { digest: "new-review" },
    () => "synthetic-operation-2",
  );
  assert.notEqual(next.key, first.key);
});
test("different selected synthetic card is a different operation", () => {
  const first = operationAttempt(
    null,
    { digest: "review", cardId: "SIM-MC-1" },
    () => "key-1",
  );
  const next = operationAttempt(
    first,
    { digest: "review", cardId: "SIM-MC-2" },
    () => "key-2",
  );
  assert.notEqual(next.key, first.key);
});
test("definitive payment failure permits a new attempt with corrected test credential", () => {
  const first = operationAttempt(null, { digest: "review" }, () => "key-1");
  const next = operationAttempt(null, { digest: "review" }, () => "key-2");
  assert.notEqual(next.key, first.key);
});
