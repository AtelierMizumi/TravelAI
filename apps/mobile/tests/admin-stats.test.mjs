import test from "node:test";
import assert from "node:assert/strict";
import { bookingSplit } from "../src/services/admin-stats.ts";

test("splits confirmed bookings between tours and hotels with percentages and bar widths", () => {
  const split = bookingSplit({ tourBookings: 3, hotelBookings: 1 });
  assert.equal(split.total, 4);
  assert.equal(split.tourPercent, 75);
  assert.equal(split.hotelPercent, 25);
  assert.equal(split.tourBar, 100);
  assert.equal(split.hotelBar, 33);
});

test("no bookings yet is an empty state, not a chart of zeros or invented data", () => {
  assert.equal(bookingSplit({ tourBookings: 0, hotelBookings: 0 }), null);
});

test("missing or non-numeric counts are not guessed", () => {
  assert.equal(bookingSplit({}), null);
  assert.equal(bookingSplit({ tourBookings: "x", hotelBookings: 2 }), null);
  assert.equal(bookingSplit(undefined), null);
});
