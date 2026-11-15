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

import { filterCatalog as filter, catalogProvinces as provincesOf } from "../src/services/admin-catalog.ts";
import { provinceFor } from "../src/services/provinces.ts";
const filterCatalog = (list, filters) => filter(list, filters, provinceFor);
const catalogProvinces = (list) => provincesOf(list, provinceFor);

const items = [
  { id: 1, name: "Tour Bà Nà", location: "Đà Nẵng", province: "Đà Nẵng", price: 900000, rating: 4.6, status: "active" },
  { id: 2, name: "Khách sạn Hội An", location: "Hội An, Quảng Nam", province: null, price: 1500000, rating: 4.1, status: "inactive" },
  { id: 3, name: "Tour Phú Quốc", location: "Phú Quốc, Kiên Giang", province: "An Giang", price: 2500000, rating: 3.2, status: "active" },
  { id: 4, name: "Dịch vụ chưa có giá", location: "", province: null, price: undefined, rating: undefined, status: undefined },
];
const ids = (list) => list.map((item) => item.id);

test("no filters keeps every item", () => {
  assert.deepEqual(ids(filterCatalog(items, {})), [1, 2, 3, 4]);
});

test("search matches name, location and province ignoring case and accents-insensitive Vietnamese casing", () => {
  assert.deepEqual(ids(filterCatalog(items, { search: "bà nà" })), [1]);
  assert.deepEqual(ids(filterCatalog(items, { search: "HỘI AN" })), [2]);
  assert.deepEqual(ids(filterCatalog(items, { search: "kiên giang" })), [3]);
});

test("province filter uses the province derived from province or location", () => {
  assert.deepEqual(ids(filterCatalog(items, { province: "Đà Nẵng" })), [1, 2]);
});

test("status filter keeps only that status", () => {
  assert.deepEqual(ids(filterCatalog(items, { status: "inactive" })), [2]);
});

test("max price keeps items at or below it and drops items with unknown price", () => {
  assert.deepEqual(ids(filterCatalog(items, { maxPrice: 1500000 })), [1, 2]);
});

test("minimum rating drops items below it and items with unknown rating", () => {
  assert.deepEqual(ids(filterCatalog(items, { minRating: 4 })), [1, 2]);
});

test("filters combine", () => {
  assert.deepEqual(ids(filterCatalog(items, { status: "active", maxPrice: 1000000, minRating: 4 })), [1]);
});

test("province list is the sorted distinct set that exists in the data", () => {
  assert.deepEqual(catalogProvinces(items), ["An Giang", "Đà Nẵng"]);
});
