import test from "node:test";
import assert from "node:assert/strict";
import { adminCatalogPath } from "../src/services/admin-catalog.ts";

test("admin lists tours and hotels from the full catalog so inactive items can be re-enabled", () => {
  assert.equal(adminCatalogPath("tours"), "/admin/catalog/tours");
  assert.equal(adminCatalogPath("hotels"), "/admin/catalog/hotels");
});

test("places keep their public endpoint", () => {
  assert.equal(adminCatalogPath("places"), "/places");
});
