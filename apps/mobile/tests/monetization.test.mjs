import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCtrPercent,
  computeMemberPrice,
  prioritizeSponsoredCatalog,
  subscriptionBadgeLabel,
  vipTeaserPrice,
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

test("computeMemberPrice calculates exact discounted VND and savings for Plus and VIP", () => {
  assert.deepEqual(computeMemberPrice(500_000, 0), {
    originalPrice: 500_000,
    memberPrice: 500_000,
    savedAmount: 0,
    hasDiscount: false,
  });
  assert.deepEqual(computeMemberPrice(500_000, 5), {
    originalPrice: 500_000,
    memberPrice: 475_000,
    savedAmount: 25_000,
    hasDiscount: true,
  });
  assert.deepEqual(computeMemberPrice(500_000, 10), {
    originalPrice: 500_000,
    memberPrice: 450_000,
    savedAmount: 50_000,
    hasDiscount: true,
  });
});

test("vipTeaserPrice shows 10% Explorer VIP savings to free users", () => {
  const teaser = vipTeaserPrice(1_200_000);
  assert.equal(teaser.vipPrice, 1_080_000);
  assert.equal(teaser.savedAmount, 120_000);
});

