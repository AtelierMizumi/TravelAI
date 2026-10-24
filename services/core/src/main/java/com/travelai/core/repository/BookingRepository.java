package com.travelai.core.repository;

import com.travelai.core.model.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByUserIdAndStatus(Long userId, String status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE " +
            "(:status IS NULL OR LOWER(b.status) = LOWER(:status)) AND " +
            "(:bookingType IS NULL OR LOWER(b.bookingType) = LOWER(:bookingType)) AND " +
            "(:keyword IS NULL OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            " LOWER(b.contactName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            " LOWER(b.contactEmail) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Booking> searchBookings(
            @Param("status") String status,
            @Param("bookingType") String bookingType,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status IN ('PAID', 'COMPLETED')")
    java.math.BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status IN ('PAID', 'COMPLETED') AND b.bookingType = 'TOUR'")
    java.math.BigDecimal calculateTourRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status IN ('PAID', 'COMPLETED') AND b.bookingType = 'HOTEL'")
    java.math.BigDecimal calculateHotelRevenue();
}

