import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCtrPercent,
  prioritizeSponsoredCatalog,
  subscriptionBadgeLabel,
} from "../src/services/monetization-helpers.ts";

test("subscriptionBadgeLabel returns badge for PLUS and VIP tiers only", () => {
  assert.equal(subscriptionBadgeLabel("FREE"), null);
  assert.equal(subscriptionBadgeLabel(undefined), null);
  assert.equal(subscriptionBadgeLabel("PLUS"), "⭐ Plus");
  assert.equal(subscriptionBadgeLabel("VIP"), "💎 Explorer");
});

test("calculateCtrPercent computes safe rounded click-through rate", () => {
  assert.equal(calculateCtrPercent(0, 0), 0);
  assert.equal(calculateCtrPercent(1000, 85), 8.5);
  assert.equal(calculateCtrPercent(12, 3), 25);
});

test("prioritizeSponsoredCatalog pins active sponsored items first without duplicates", () => {
  const items = [
    { id: 1, name: "Tour thường A", price: 100000, rating: 4.5, location: "Đà Nẵng" },
    { id: 2, name: "Tour tài trợ B", price: 200000, rating: 4.8, location: "Đà Nẵng" },
    { id: 3, name: "Tour thường C", price: 150000, rating: 4.2, location: "Huế" },
  ];
  const sponsored = [
    {
      id: "camp-1",
      targetKind: "TOUR",
      targetId: 2,
      headline: "Ưu đãi hè",
      sponsoredLabel: "Được tài trợ",
    },
  ];
  const ordered = prioritizeSponsoredCatalog(items, sponsored, "TOUR");
  assert.deepEqual(
    ordered.map((entry) => ({ id: entry.item.id, sponsored: Boolean(entry.campaign) })),
    [
      { id: 2, sponsored: true },
      { id: 1, sponsored: false },
      { id: 3, sponsored: false },
    ],
  );
});
