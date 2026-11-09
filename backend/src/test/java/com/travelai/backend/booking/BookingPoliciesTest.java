package com.travelai.backend.booking;

import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class BookingPoliciesTest {
    @Test void feeAlwaysUsesOriginalAmountAndHalfUpRounding() {
        assertEquals(20, BookingPolicies.reschedulingFee(101));
        assertEquals(20, BookingPolicies.reschedulingFee(102));
        assertEquals(21, BookingPolicies.reschedulingFee(103));
        assertEquals(20, BookingPolicies.reschedulingFee(100));
    }
    @Test void aggregateRefundAndRetainedRemainderReconcile() {
        assertEquals(66, BookingPolicies.voluntaryRefund(101));
        assertEquals(35, 101 - BookingPolicies.voluntaryRefund(101));
        assertEquals(72, BookingPolicies.voluntaryRefund(110));
        assertEquals(130, BookingPolicies.voluntaryRefund(200));
    }
    @Test void bothStrictCutoffsMustPassAtOneRequestTime() {
        Instant start = Instant.parse("2026-11-10T03:00:00Z");
        Instant deadline = start.minusSeconds(3600);
        assertTrue(BookingPolicies.withinCutoffs(deadline.minusSeconds(1), start, 1, start.plusSeconds(7200), 2));
        assertFalse(BookingPolicies.withinCutoffs(deadline, start, 1, start.plusSeconds(7200), 2));
        assertFalse(BookingPolicies.withinCutoffs(start.minusSeconds(1), start, 0, start.minusSeconds(3600), 0));
        assertThrows(IllegalArgumentException.class, () -> BookingPolicies.cutoff(start, -1));
    }
    @Test void noShowIsEligibleAtGraceEndAndZeroGrace() {
        Instant start = Instant.parse("2026-11-10T03:00:00Z");
        assertFalse(BookingPolicies.noShowEligible(start.plusSeconds(1799), start, 30));
        assertTrue(BookingPolicies.noShowEligible(start.plusSeconds(1800), start, 30));
        assertTrue(BookingPolicies.noShowEligible(start, start, 0));
    }
    @Test void cardExpiryUsesVietnamNextMonthMidnightAndActiveStatus() {
        Instant expiry = LocalDate.of(2027, 1, 1).atStartOfDay(BookingPolicies.VIETNAM).toInstant();
        assertTrue(BookingPolicies.cardPayable(expiry.minusSeconds(1), 12, 2026, "ACTIVE"));
        assertFalse(BookingPolicies.cardPayable(expiry, 12, 2026, "ACTIVE"));
        assertFalse(BookingPolicies.cardPayable(expiry.minusSeconds(1), 12, 2026, "LOCKED"));
        assertFalse(BookingPolicies.cardPayable(expiry.minusSeconds(1), 12, 2026, null));
    }
    @Test void ordinaryWeekendsAndPeakDatesNeverAddPriceDifference() {
        LocalDate day = LocalDate.of(2026, 11, 7);
        assertEquals(0, BookingPolicies.holidayDifference(List.of(day), List.of(100L), List.of(500L), Set.of()));
        assertEquals(400, BookingPolicies.holidayDifference(List.of(day), List.of(100L), List.of(500L), Set.of(day)));
    }
    @Test void matchedNightsUseOrdinalPricesWithNoNegativeOffset() {
        List<LocalDate> dates = List.of(LocalDate.of(2026, 11, 7), LocalDate.of(2026, 11, 8));
        assertEquals(50, BookingPolicies.holidayDifference(dates, List.of(100L,200L), List.of(150L,180L), Set.copyOf(dates)));
        assertEquals(80, BookingPolicies.holidayDifference(dates, List.of(200L,100L), List.of(150L,180L), Set.copyOf(dates)));
    }
    @Test void addedRoomsAndNightsChargeFullPriceOnlyOnHolidayNights() {
        List<LocalDate> dates = List.of(LocalDate.of(2026, 12, 31), LocalDate.of(2027, 1, 1));
        assertEquals(180, BookingPolicies.holidayDifference(dates, List.of(), List.of(150L,180L), Set.of(dates.get(1))));
        assertEquals(220, BookingPolicies.reschedulingFee(200) + BookingPolicies.holidayDifference(dates, List.of(), List.of(150L,180L), Set.of(dates.get(1))));
    }
    @Test void removedNightsAndRoomsHaveNoRefundAndNightIntervalExcludesCheckout() {
        LocalDate start = LocalDate.of(2026, 12, 31);
        assertEquals(List.of(start, start.plusDays(1)), BookingPolicies.nights(start, start.plusDays(2)));
        assertEquals(0, BookingPolicies.holidayDifference(List.of(start), List.of(100L,200L), List.of(80L), Set.of(start)));
        assertThrows(IllegalArgumentException.class, () -> BookingPolicies.nights(start, start));
    }
    @Test void invalidMoneyAndOverflowRejectInsteadOfWrapping() {
        assertThrows(IllegalArgumentException.class, () -> BookingPolicies.reschedulingFee(-1));
        assertThrows(IllegalArgumentException.class, () -> BookingPolicies.holidayDifference(List.of(LocalDate.now()), List.of(), List.of(-1L), Set.of(LocalDate.now())));
    }
}
