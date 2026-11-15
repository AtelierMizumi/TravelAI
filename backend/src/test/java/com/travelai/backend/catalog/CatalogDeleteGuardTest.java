package com.travelai.backend.catalog;

import com.travelai.backend.entity.*;
import com.travelai.backend.repository.*;
import com.travelai.backend.security.SessionService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** A tour or hotel that already carries bookings must never be deleted (data integrity). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogDeleteGuardTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SessionService sessions;
    @Autowired TourRepository tours;
    @Autowired HotelRepository hotels;
    @Autowired TourBookingRepository tourBookings;
    @Autowired HotelBookingRepository hotelBookings;
    @Autowired JdbcTemplate jdbc;

    String adminToken;
    long adminId;

    @BeforeEach void admin() {
        User user = new User();
        user.setEmail(UUID.randomUUID() + "@example.test"); user.setRole("ADMIN"); user.setStatus("active");
        user.setPassword("synthetic-fixture");
        user = users.saveAndFlush(user);
        adminId = user.getId();
        adminToken = "Bearer " + sessions.login(user.getEmail(), "synthetic-fixture").get("token");
    }

    void reserve(String kind, long catalogId) {
        String offering = "guard-" + UUID.randomUUID();
        jdbc.update("insert into booking_offerings(id, legacy_id, kind, version, active, definition) values (?,?,?,?,?,?)",
                offering, catalogId, kind, "v1", true, "{}");
        jdbc.update("insert into booking_reservations(id, owner_id, offering_id, status, original_amount, total_paid, revision, created_at, itinerary) "
                + "values (?,?,?,?,?,?,?,now(),?)", "res-" + UUID.randomUUID(), adminId, offering, "CONFIRMED", 0, 0, 0, "{}");
    }

    @Test void tourWithAReservationIsKept() throws Exception {
        Tour tour = tours.save(Tour.builder().name("Guarded tour " + UUID.randomUUID()).location("Hội An").status("active").build());
        reserve("TOUR", tour.getId());
        mvc.perform(delete("/api/tours/" + tour.getId()).header("Authorization", adminToken))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.message").exists());
        assertTrue(tours.existsById(tour.getId()));
    }

    @Test void hotelWithAReservationIsKept() throws Exception {
        Hotel hotel = hotels.save(Hotel.builder().name("Guarded hotel " + UUID.randomUUID()).location("Đà Nẵng").status("active").build());
        reserve("HOTEL", hotel.getId());
        mvc.perform(delete("/api/hotels/" + hotel.getId()).header("Authorization", adminToken))
                .andExpect(status().isConflict());
        assertTrue(hotels.existsById(hotel.getId()));
    }

    @Test void tourWithALegacyBookingIsKept() throws Exception {
        Tour tour = tours.save(Tour.builder().name("Legacy tour " + UUID.randomUUID()).location("Huế").status("active").build());
        tourBookings.save(TourBooking.builder().userId(adminId).tourName(tour.getName()).status("pending").createdAt(LocalDateTime.now()).build());
        mvc.perform(delete("/api/tours/" + tour.getId()).header("Authorization", adminToken)).andExpect(status().isConflict());
        assertTrue(tours.existsById(tour.getId()));
    }

    @Test void hotelWithALegacyBookingIsKept() throws Exception {
        Hotel hotel = hotels.save(Hotel.builder().name("Legacy hotel " + UUID.randomUUID()).location("Huế").status("active").build());
        hotelBookings.save(HotelBooking.builder().userId(adminId).hotelName(hotel.getName()).status("pending").createdAt(LocalDateTime.now()).build());
        mvc.perform(delete("/api/hotels/" + hotel.getId()).header("Authorization", adminToken)).andExpect(status().isConflict());
        assertTrue(hotels.existsById(hotel.getId()));
    }

    @Test void unreferencedTourAndHotelAreDeleted() throws Exception {
        Tour tour = tours.save(Tour.builder().name("Free tour " + UUID.randomUUID()).location("Hà Nội").status("active").build());
        Hotel hotel = hotels.save(Hotel.builder().name("Free hotel " + UUID.randomUUID()).location("Hà Nội").status("active").build());
        mvc.perform(delete("/api/tours/" + tour.getId()).header("Authorization", adminToken)).andExpect(status().isOk());
        mvc.perform(delete("/api/hotels/" + hotel.getId()).header("Authorization", adminToken)).andExpect(status().isOk());
        assertFalse(tours.existsById(tour.getId()));
        assertFalse(hotels.existsById(hotel.getId()));
    }
}
