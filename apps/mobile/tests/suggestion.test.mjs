import test from "node:test";
import assert from "node:assert/strict";
import { suggestedPlaceQuery } from "../src/services/suggestion.ts";

const candidate = (name, score = 1) => ({ code: name, name, province: "Hồ Chí Minh", score });

test("a predicted result with a catalog candidate suggests its name for one-tap confirmation", () => {
  assert.equal(
    suggestedPlaceQuery({ recognitionStatus: "predicted", catalogCandidates: [candidate("Chợ Bến Thành"), candidate("Dinh Độc Lập")] }),
    "Chợ Bến Thành",
  );
});

test("an unknown result with a catalog candidate still suggests it", () => {
  assert.equal(suggestedPlaceQuery({ recognitionStatus: "unknown", catalogCandidates: [candidate("Văn Miếu - Quốc Tử Giám")] }), "Văn Miếu - Quốc Tử Giám");
});

test("an identified result is resolved by code, so nothing is suggested", () => {
  assert.equal(suggestedPlaceQuery({ recognitionStatus: "identified", catalogCandidates: [candidate("Chợ Bến Thành")] }), "");
});

test("no candidates, a missing field or a blank name suggests nothing", () => {
  assert.equal(suggestedPlaceQuery({ recognitionStatus: "predicted", catalogCandidates: [] }), "");
  assert.equal(suggestedPlaceQuery({ recognitionStatus: "predicted" }), "");
  assert.equal(suggestedPlaceQuery({ recognitionStatus: "predicted", catalogCandidates: [candidate("  ")] }), "");
});
