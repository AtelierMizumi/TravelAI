package com.travelai.backend.admin;

import com.travelai.backend.repository.PlaceRepository;
import com.travelai.backend.repository.PostRepository;
import com.travelai.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Canonical-only admin analytics.
 * Counts canonical SIMULATED bookings from booking_reservations and
 * revenue from the simulated_transactions ledger. Legacy
 * TourBooking/HotelBooking tables are never included.
 */
@Service
@Transactional
public class AnalyticsAggregation {

    public static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final EntityManager em;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PlaceRepository placeRepository;

    public AnalyticsAggregation(EntityManager em,
                                UserRepository userRepository,
                                PostRepository postRepository,
                                PlaceRepository placeRepository) {
        this.em = em;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.placeRepository = placeRepository;
    }

    public Map<String, Object> getStats(LocalDate from, LocalDate to) {
        long canonicalBookings = canonicalBookingsCount(from, to);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("users", userRepository.count());
        stats.put("posts", postRepository.count());
        stats.put("places", placeRepository.count());
        stats.put("totalBookings", canonicalBookings);
        stats.put("canonicalBookings", canonicalBookings);
        stats.put("from", from.toString());
        stats.put("to", to.toString());
        stats.put("timezone", BUSINESS_ZONE.getId());
        return stats;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> revenueSeries(LocalDate from, LocalDate to) {
        List<Object[]> rows = em.createNativeQuery(
                        "select to_char(created_at at time zone :zone, 'YYYY-MM') as month, " +
                                "coalesce(sum(case when kind = 'CHARGE' then amount " +
                                "when kind = 'REFUND' then -amount else 0 end), 0) as revenue " +
                                "from simulated_transactions " +
                                "where kind in ('CHARGE', 'REFUND') " +
                                "and (created_at at time zone :zone)::date between :from and :to " +
                                "group by month order by month")
                .setParameter("zone", BUSINESS_ZONE.getId())
                .setParameter("from", from)
                .setParameter("to", to)
                .getResultList();
        return rows.stream()
                .map(row -> {
                    Map<String, Object> point = new LinkedHashMap<>();
                    point.put("month", row[0]);
                    point.put("revenue", ((Number) row[1]).longValue());
                    return point;
                })
                .toList();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> topServices(int limit) {
        List<Object[]> rows = em.createNativeQuery(
                        "select cast(itinerary as jsonb)->>'name' as name, count(*) as bookings " +
                                "from booking_reservations " +
                                "where status = 'CONFIRMED' " +
                                "group by name order by bookings desc, name asc limit :limit")
                .setParameter("limit", limit)
                .getResultList();
        return rows.stream()
                .map(row -> {
                    Map<String, Object> service = new LinkedHashMap<>();
                    service.put("name", row[0]);
                    service.put("bookings", ((Number) row[1]).longValue());
                    return service;
                })
                .toList();
    }

    private long canonicalBookingsCount(LocalDate from, LocalDate to) {
        return ((Number) em.createNativeQuery(
                        "select count(*) from booking_reservations " +
                                "where status = 'CONFIRMED' " +
                                "and (created_at at time zone :zone)::date between :from and :to")
                .setParameter("zone", BUSINESS_ZONE.getId())
                .setParameter("from", from)
                .setParameter("to", to)
                .getSingleResult()).longValue();
    }
}
