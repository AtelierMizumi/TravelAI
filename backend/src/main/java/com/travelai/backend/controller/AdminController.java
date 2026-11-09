package com.travelai.backend.controller;

import com.travelai.backend.repository.HotelBookingRepository;
import com.travelai.backend.repository.PlaceRepository;
import com.travelai.backend.repository.PostRepository;
import com.travelai.backend.repository.TourBookingRepository;
import com.travelai.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import jakarta.persistence.EntityManager;

import java.time.Clock;
import java.time.LocalDate;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EntityManager em;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TourBookingRepository tourBookingRepository;
    private final HotelBookingRepository hotelBookingRepository;
    private final PlaceRepository placeRepository;
    private final com.travelai.backend.admin.AnalyticsAggregation analytics;
    private final Clock clock;

    public AdminController(
            EntityManager em,
            UserRepository userRepository,
            PostRepository postRepository,
            TourBookingRepository tourBookingRepository,
            HotelBookingRepository hotelBookingRepository,
            PlaceRepository placeRepository,
            com.travelai.backend.admin.AnalyticsAggregation analytics,
            Clock clock
    ) {
        this.em = em;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.tourBookingRepository = tourBookingRepository;
        this.hotelBookingRepository = hotelBookingRepository;
        this.placeRepository = placeRepository;
        this.analytics = analytics;
        this.clock = clock;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long users = userRepository.count();
        long posts = postRepository.count();
        long tourBookings = tourBookingRepository.count() + canonicalCount("TOUR");
        long hotelBookings = hotelBookingRepository.count() + canonicalCount("HOTEL");
        long places = placeRepository.count();

        long totalBookings = tourBookings + hotelBookings;

        return ResponseEntity.ok(
                Map.of(
                        "users", users,
                        "posts", posts,
                        "tourBookings", tourBookings,
                        "hotelBookings", hotelBookings,
                        "totalBookings", totalBookings,
                        "places", places
                )
        );
    }

    private long canonicalCount(String kind) {
        return ((Number)em.createNativeQuery("select count(*) from booking_reservations where cast(itinerary as jsonb)->>'kind'=:kind")
                .setParameter("kind", kind).getSingleResult()).longValue();
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> analytics() {
        com.travelai.backend.security.ApiSecurity.currentActor().requireAdmin();
        LocalDate now = LocalDate.now(com.travelai.backend.admin.AnalyticsAggregation.BUSINESS_ZONE);
        LocalDate from = now.minusMonths(12).plusDays(1);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("stats", analytics.getStats(from, now));
        result.put("revenueSeries", analytics.revenueSeries(from, now));
        result.put("topServices", analytics.topServices(10));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        com.travelai.backend.security.ApiSecurity.currentActor().requireAdmin();
        return ResponseEntity.ok(userRepository.findAll());
    }
}