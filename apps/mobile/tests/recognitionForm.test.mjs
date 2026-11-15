import test from "node:test";
import assert from "node:assert/strict";
import { appendImagePart } from "../src/services/recognitionForm.ts";

test("image part is a Blob read from the local uri on every platform", async () => {
  const calls = [];
  const fakeFetch = async (uri, init) => {
    calls.push({ uri, signal: init?.signal });
    return { blob: async () => new Blob(["jpeg-bytes"], { type: "image/jpeg" }) };
  };
  const controller = new AbortController();
  const body = new FormData();

  await appendImagePart(body, "file:///cache/photo.jpg", controller.signal, fakeFetch);

  const part = body.get("file");
  assert.ok(part instanceof Blob, "multipart part must be a Blob/File, not a plain {uri,name,type} object");
  assert.equal(part.name, "recognition.jpg");
  assert.equal(part.size, "jpeg-bytes".length);
  assert.deepEqual(calls, [{ uri: "file:///cache/photo.jpg", signal: controller.signal }]);
});

test("a failed read of the local image surfaces as an error", async () => {
  const fakeFetch = async () => { throw new Error("read failed"); };
  await assert.rejects(
    appendImagePart(new FormData(), "file:///missing.jpg", new AbortController().signal, fakeFetch),
    /read failed/,
  );
});
