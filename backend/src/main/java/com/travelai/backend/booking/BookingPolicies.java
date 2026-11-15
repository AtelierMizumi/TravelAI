package com.travelai.backend.booking;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;

/** Pure rules shared by original booking, rescheduling and cancellation. */
public final class BookingPolicies {
    public static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private BookingPolicies() {}

    public static long reschedulingFee(long originalAmount) {
        return percentage(originalAmount, 20);
    }
    public static long voluntaryRefund(long paidTotal) {
        return percentage(paidTotal, 65);
    }
    private static long percentage(long amount, int percent) {
        require(amount >= 0, "Amount must be nonnegative SIMULATED VND");
        return BigDecimal.valueOf(amount).multiply(BigDecimal.valueOf(percent))
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP).longValueExact();
    }
    public static Instant cutoff(Instant start, long hours) {
        require(hours >= 0, "Cutoff must be nonnegative whole hours");
        return start.minusSeconds(Math.multiplyExact(hours, 3600));
    }
    public static boolean withinCutoffs(Instant request, Instant currentStart, long currentHours,
                                         Instant proposedStart, long proposedHours) {
        return request.isBefore(cutoff(currentStart, currentHours))
                && request.isBefore(cutoff(proposedStart, proposedHours));
    }
    public static boolean noShowEligible(Instant request, Instant start, long graceMinutes) {
        require(graceMinutes >= 0, "Grace must be nonnegative whole minutes");
        return !request.isBefore(start.plusSeconds(Math.multiplyExact(graceMinutes, 60)));
    }
    public static boolean cardPayable(Instant request, int month, int year, String status) {
        if (!"ACTIVE".equals(status) || month < 1 || month > 12 || year < 1 || year >= 9999) return false;
        Instant expiry = YearMonth.of(year, month).plusMonths(1).atDay(1).atStartOfDay(VIETNAM).toInstant();
        return request.isBefore(expiry);
    }
    public static List<LocalDate> nights(LocalDate checkIn, LocalDate checkOut) {
        require(checkIn != null && checkOut != null && checkOut.isAfter(checkIn), "Checkout must be after check-in");
        return checkIn.datesUntil(checkOut).toList();
    }
    public static long holidayDifference(List<LocalDate> newDates, List<Long> oldPrices,
                                          List<Long> newPrices, Set<LocalDate> holidays) {
        require(newDates.size() == newPrices.size(), "Night dates and prices must match");
        for (Long price : oldPrices) require(price != null && price >= 0, "Invalid recorded price");
        long total = 0;
        for (int i = 0; i < newDates.size(); i++) {
            Long price = newPrices.get(i);
            require(price != null && price >= 0, "Invalid proposed price");
            if (holidays.contains(newDates.get(i))) {
                long baseline = i < oldPrices.size() ? oldPrices.get(i) : 0;
                total = Math.addExact(total, Math.max(0, price - baseline));
            }
        }
        return total;
    }
    public static void require(boolean condition, String message) {
        if (!condition) throw new IllegalArgumentException(message);
    }
}
