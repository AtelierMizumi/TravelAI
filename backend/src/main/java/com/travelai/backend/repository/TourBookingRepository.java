package com.travelai.backend.repository;

import com.travelai.backend.entity.TourBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourBookingRepository extends JpaRepository<TourBooking, Long> {

    List<TourBooking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Long countByUserId(Long userId);
}