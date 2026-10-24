package com.travelai.core.repository;

import com.travelai.core.model.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByLocationId(Long locationId, Pageable pageable);

    Page<Review> findByTourId(Long tourId, Pageable pageable);

    Page<Review> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndLocationId(Long userId, Long locationId);

    boolean existsByUserIdAndTourId(Long userId, Long tourId);

    Optional<Review> findByUserIdAndLocationId(Long userId, Long locationId);

    Optional<Review> findByUserIdAndTourId(Long userId, Long tourId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.location.id = :locationId")
    Double calculateAverageRatingByLocation(@Param("locationId") Long locationId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.location.id = :locationId")
    Long countByLocationId(@Param("locationId") Long locationId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tour.id = :tourId")
    Double calculateAverageRatingByTour(@Param("tourId") Long tourId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.tour.id = :tourId")
    Long countByTourId(@Param("tourId") Long tourId);
}
