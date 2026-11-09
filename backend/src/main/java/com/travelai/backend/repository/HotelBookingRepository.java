package com.travelai.backend.repository;

import com.travelai.backend.entity.HotelBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelBookingRepository extends JpaRepository<HotelBooking, Long> {

    List<HotelBooking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Long countByUserId(Long userId);
}