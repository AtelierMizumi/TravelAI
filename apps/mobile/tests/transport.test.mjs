import test from "node:test";
import assert from "node:assert/strict";
import { requestJson, ApiError } from "../src/services/transport.ts";

test("backend response is returned without substituting local data", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(JSON.stringify({ id: "server-id", amount: 123 }), {
        status: 200,
      }),
  );
  assert.deepEqual(await requestJson("https://example.test/api"), {
    id: "server-id",
    amount: 123,
  });
});
test("expired session invokes the expiration handler", async (t) => {
  let expired = 0;
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(JSON.stringify({ message: "Expired" }), { status: 401 }),
  );
  await assert.rejects(
    requestJson("https://example.test/api", {}, () => expired++),
    (error) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(expired, 1);
});
test("conflict preserves the authoritative server reason", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(JSON.stringify({ message: "Inventory changed" }), {
        status: 409,
      }),
  );
  await assert.rejects(
    requestJson("https://example.test/api"),
    (error) => error.status === 409 && error.message === "Inventory changed",
  );
});
test("network failure is never reported as a successful booking", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Synthetic network failure");
  });
  await assert.rejects(
    requestJson("https://example.test/api"),
    (error) => error instanceof ApiError && error.status === 0,
  );
});
test("server timeout completes with an unknown-result retry message", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      }),
  );
  await assert.rejects(
    requestJson("https://example.test/api", {}, () => {}, 10),
    (error) => error.status === 0 && error.message.includes("cùng yêu cầu"),
  );
});
