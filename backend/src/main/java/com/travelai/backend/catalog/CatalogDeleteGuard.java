package com.travelai.backend.catalog;

import com.travelai.backend.entity.Hotel;
import com.travelai.backend.entity.Tour;
import com.travelai.backend.repository.HotelBookingRepository;
import com.travelai.backend.repository.TourBookingRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Decides whether a catalog item still carries bookings and therefore must not be deleted. */
@Component
public class CatalogDeleteGuard {
    public static final String MESSAGE =
            "Dịch vụ đã có đặt chỗ nên không thể xóa; hãy chuyển sang trạng thái ngừng hoạt động.";

    private final JdbcTemplate jdbc;
    private final TourBookingRepository tourBookings;
    private final HotelBookingRepository hotelBookings;

    public CatalogDeleteGuard(JdbcTemplate jdbc, TourBookingRepository tourBookings, HotelBookingRepository hotelBookings) {
        this.jdbc = jdbc;
        this.tourBookings = tourBookings;
        this.hotelBookings = hotelBookings;
    }

    public boolean inUse(Tour tour) {
        return reserved("TOUR", tour.getId()) || tourBookings.existsByTourName(tour.getName());
    }

    public boolean inUse(Hotel hotel) {
        return reserved("HOTEL", hotel.getId()) || hotelBookings.existsByHotelName(hotel.getName());
    }

    private boolean reserved(String kind, Long catalogId) {
        Boolean found = jdbc.queryForObject(
                "select count(*) > 0 from booking_reservations r join booking_offerings o on o.id = r.offering_id "
                        + "where o.kind = ? and o.legacy_id = ?", Boolean.class, kind, catalogId);
        return Boolean.TRUE.equals(found);
    }
}
