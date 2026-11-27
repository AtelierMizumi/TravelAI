package com.travelai.backend.booking;

import java.time.*;
import java.util.*;

public final class BookingContracts {
    private BookingContracts() {}
    public record Policy(Integer cancellationHours, Integer reschedulingHours, Integer graceMinutes,
                         Integer holdMinutes, Integer holidayReschedulingHours) {}
    public record Departure(Instant start, int capacity, List<String> seats, long price, Instant end) {
        public Departure(Instant start, int capacity, List<String> seats, long price) { this(start, capacity, seats, price, null); }
    }
    public record Room(String id, String number, int maxGuests, long price, Map<LocalDate,Long> nightlyPrices) {}
    public record Promotion(LocalDate from, LocalDate through, int percent) {}
    public record OfferInput(String id, String kind, Long legacyId, String name, boolean active,
                             Policy policy, LocalTime checkInTime, LocalTime checkOutTime,
                             List<Departure> departures, List<Room> rooms, Promotion promotion) {
        public OfferInput(String id, String kind, Long legacyId, String name, boolean active, Policy policy,
                          LocalTime checkInTime, LocalTime checkOutTime, List<Departure> departures, List<Room> rooms) {
            this(id, kind, legacyId, name, active, policy, checkInTime, checkOutTime, departures, rooms, null);
        }
    }
    public record CalendarInput(int year, String source, Set<LocalDate> holidays, boolean approved) {}
    public record BankInput(long ownerId, long balance, int expiryMonth, int expiryYear, String bankName) {
        public BankInput(long ownerId,long balance,int expiryMonth,int expiryYear) { this(ownerId,balance,expiryMonth,expiryYear,null); }
    }
    public record BankLinkInput(String bankName, String accountNumber, String testCvv) {}
    public record ReviewInput(String offeringId, String bookingId, Long bookingRevision, Instant departure,
                              LocalDate checkIn, LocalDate checkOut, int guests, List<String> seats,
                              Map<String,Integer> roomGuests, Map<String,String> replacementRooms) {}
    public record PayInput(String digest, boolean confirmed, String cardId, String testCvv) {}
    public record CancelInput(String reason) {}
    public record NoShowInput(String reason, Set<String> releaseResources) {}
    public record Resource(String key, int quantity, int capacity, Instant start) {}
    public record NightCharge(String room, LocalDate date, Long baseline, long price,
                              boolean holiday, long additional, boolean added) {}
    public record Itinerary(ReviewInput selection, String offeringVersion, String name, String kind,
                            Instant start, Instant end, String timezone, Policy policy, Map<String,List<Long>> roomPrices,
                            List<Resource> resources, long itineraryPrice, int changeHours) {}
    public record Quote(Itinerary itinerary, long originalAmount, long fee, long holidayDifference,
                        long total, List<NightCharge> nights, boolean holiday, Map<Integer,String> calendarVersions,
                        int memberDiscountPercent, long memberDiscount, String memberTier) {
        public Quote(Itinerary itinerary, long originalAmount, long fee, long holidayDifference,
                     long total, List<NightCharge> nights, boolean holiday, Map<Integer,String> calendarVersions) {
            this(itinerary, originalAmount, fee, holidayDifference, total, nights, holiday, calendarVersions, 0, 0L, "FREE");
        }
    }
    public record SubscriptionPurchaseInput(String planCode, String cardId, String testCvv, boolean confirmed) {}
    public record AdPurchaseInput(String packageCode, String targetKind, Long targetId, String headline,
                                  String cardId, String testCvv, boolean confirmed) {}
    public record AdDecisionInput(String action, String reason) {}
    public record PlanUpdateInput(String name, Long priceVnd, Integer durationDays, Integer discountPercent,
                                  Boolean waiveFirstRescheduleFee, Boolean unlimitedAi, String badge,
                                  String description, Boolean active) {}
    public record PackageUpdateInput(String name, Long priceVnd, Integer durationDays, String placement,
                                     String description, Boolean active) {}
}
