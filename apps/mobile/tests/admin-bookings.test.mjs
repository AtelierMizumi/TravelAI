import test from "node:test";
import assert from "node:assert/strict";
import { dateParts, filterRows, groupRows } from "../src/services/admin-bookings.ts";

const row = (over) => ({ key: "k", group: "offer:1", name: "Tour Bà Nà", kind: "TOUR", province: "Đà Nẵng", date: "2026-06-01", time: "10:00", customer: "An", status: "CONFIRMED", ...over });

test("dates are shown in Asia/Ho_Chi_Minh, so late UTC evenings fall on the next local day", () => {
  assert.deepEqual(dateParts("2026-06-01T20:30:00Z"), { date: "2026-06-02", time: "03:30" });
});

test("date-only values keep their day and have no time", () => {
  assert.deepEqual(dateParts("2026-06-01"), { date: "2026-06-01", time: "" });
});

test("missing or invalid dates stay empty instead of being guessed", () => {
  assert.deepEqual(dateParts(undefined), { date: "", time: "" });
  assert.deepEqual(dateParts("not a date"), { date: "", time: "" });
});

test("rows are grouped per service and groups list their bookers", () => {
  const groups = groupRows([row({ key: "a" }), row({ key: "b", customer: "Bình" }), row({ key: "c", group: "offer:2", name: "Tour Hội An" })]);
  assert.deepEqual(groups.map((g) => [g.name, g.rows.length]), [["Tour Bà Nà", 2], ["Tour Hội An", 1]]);
});

test("query matches service name, customer and booking code", () => {
  const rows = [row({ key: "BK-1", name: "Tour Bà Nà" }), row({ key: "BK-2", name: "Phú Quốc", customer: "Cường" })];
  assert.equal(filterRows(rows, { query: "bà nà" }).length, 1);
  assert.equal(filterRows(rows, { query: "cường" }).length, 1);
  assert.equal(filterRows(rows, { query: "bk-2" }).length, 1);
});

test("province and status filters exclude rows that lack the field", () => {
  const rows = [row({ key: "a" }), row({ key: "b", province: "" }), row({ key: "c", status: "CANCELLED" })];
  assert.deepEqual(filterRows(rows, { province: "Đà Nẵng" }).map((r) => r.key), ["a", "c"]);
  assert.deepEqual(filterRows(rows, { status: "CANCELLED" }).map((r) => r.key), ["c"]);
});

test("without filters, rows with missing data are still shown", () => {
  assert.equal(filterRows([row({ province: "", date: "", time: "" })], {}).length, 1);
});

test("date range is inclusive and drops rows with no date", () => {
  const rows = [row({ key: "a", date: "2026-06-01" }), row({ key: "b", date: "2026-06-05" }), row({ key: "c", date: "" })];
  assert.deepEqual(filterRows(rows, { from: "2026-06-01", to: "2026-06-03" }).map((r) => r.key), ["a"]);
  assert.deepEqual(filterRows(rows, { from: "2026-06-02" }).map((r) => r.key), ["b"]);
});

test("time range drops rows with no time", () => {
  const rows = [row({ key: "a", time: "09:00" }), row({ key: "b", time: "15:00" }), row({ key: "c", time: "" })];
  assert.deepEqual(filterRows(rows, { timeFrom: "10:00", timeTo: "16:00" }).map((r) => r.key), ["b"]);
});
