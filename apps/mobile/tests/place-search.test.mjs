import test from "node:test";
import assert from "node:assert/strict";
import { searchPlaces } from "../src/services/place-search.ts";
const places = [{ id: 1, name: "Chợ Bến Thành", province: "Hồ Chí Minh" }, { id: 2, name: "Vịnh Hạ Long", province: "Quảng Ninh" }];
test("searches actual backend places by name and province without accents", () => {
  assert.deepEqual(searchPlaces(places, "ben thanh").map((p) => p.id), [1]);
  assert.deepEqual(searchPlaces(places, "quang ninh").map((p) => p.id), [2]);
  assert.deepEqual(searchPlaces(places, "Big Ben"), []);
  assert.deepEqual(searchPlaces(places, " "), []);
});
