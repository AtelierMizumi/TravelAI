package com.travelai.backend.admin;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.SessionService;
import com.travelai.backend.security.SessionService.Actor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Canonical-only analytics (spec §5 Analytics, Task 6).
 * Legacy TourBooking/HotelBooking rows must not move any number.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsAggregationIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SessionService sessions;
    @Autowired JdbcTemplate jdbc;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper json;

    Actor makeUser(String role) {
        User user = new User();
        user.setEmail(UUID.randomUUID() + "@example.test");
        user.setRole(role);
        user.setStatus("active");
        user.setPassword("synthetic-fixture");
        return new Actor(users.saveAndFlush(user).getId(), role);
    }

    String bearer(Actor actor) {
        String email = users.findById(actor.id()).orElseThrow().getEmail();
        return "Bearer " + sessions.login(email, "synthetic-fixture").get("token");
    }

    void seedCanonicalReservation(String id, String status, long totalPaid, String name) {
        jdbc.update(
                "insert into booking_reservations (id, owner_id, offering_id, source_account_id, status, original_amount, total_paid, revision, created_at, itinerary) values (?,?,?,?,?,?,?,?,?,?)",
                id, 1L, "offer-" + id, "acct-1", status, totalPaid, totalPaid, 1,
                java.sql.Timestamp.from(java.time.Instant.parse("2026-01-01T00:00:00Z")),
                "{\"kind\":\"TOUR\",\"name\":\"" + name + "\"}");
    }

    void seedTransaction(String id, String reservationId, String kind, long amount, String createdAt) {
        jdbc.update(
                "insert into simulated_transactions (id, account_id, reservation_id, operation_id, kind, amount, created_at) values (?,?,?,?,?,?,?)",
                id, "acct-1", reservationId, "op-" + id, kind, amount, java.sql.Timestamp.valueOf(createdAt));
    }

    @Test void analyticsCountsOnlyCanonicalBookingsByMonth() throws Exception {
        Actor admin = makeUser("ADMIN");
        Actor user = makeUser("USER");

        String before = mvc.perform(get("/api/admin/analytics").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        long baseline = json.readTree(before).get("stats").get("totalBookings").asLong();
        long baselineJanRevenue = 0;
        for (var p : json.readTree(before).get("revenueSeries")) {
            if ("2026-01".equals(p.get("month").asText())) {
                baselineJanRevenue = p.get("revenue").asLong();
            }
        }

        seedCanonicalReservation("r-dec", "CONFIRMED", 1_000_000, "Ha Long Tour");
        seedCanonicalReservation("r-jan", "CONFIRMED", 2_000_000, "Ha Long Tour");
        seedTransaction("t-dec", "r-dec", "CHARGE", 1_000_000, "2025-12-15 10:00:00");
        seedTransaction("t-jan", "r-jan", "CHARGE", 2_000_000, "2026-01-14 10:00:00");
        seedTransaction("t-ref", "r-jan", "REFUND", 500_000, "2026-01-20 10:00:00");
        // Legacy booking row must not inflate canonical numbers.
        jdbc.update("insert into hotel_bookings (user_id, user_name, hotel_name, unit_price, price, rooms, guests, check_in, check_out, status, created_at) values (?, 'Legacy', 'Legacy Hotel', 1, 999999, 1, 1, '2026-01-01','2026-01-02','PENDING',NOW())", user.id());

        mvc.perform(get("/api/admin/analytics").header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());

        String after = mvc.perform(get("/api/admin/analytics").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.totalBookings").value(baseline + 2))
                .andReturn().getResponse().getContentAsString();

        var tree = json.readTree(after);
        Map<String, Long> revenueByMonth = new java.util.HashMap<>();
        for (var p : tree.get("revenueSeries")) {
            revenueByMonth.put(p.get("month").asText(), p.get("revenue").asLong());
        }
        org.junit.jupiter.api.Assertions.assertEquals(1_000_000L, revenueByMonth.get("2025-12"));
        org.junit.jupiter.api.Assertions.assertEquals(baselineJanRevenue + 1_500_000L, revenueByMonth.get("2026-01"));
        boolean foundService = false;
        for (var svc : tree.get("topServices")) {
            if ("Ha Long Tour".equals(svc.get("name").asText()) && svc.get("bookings").asLong() >= 2) {
                foundService = true;
            }
        }
        org.junit.jupiter.api.Assertions.assertTrue(foundService, "Ha Long Tour must appear in topServices");
    }
}
