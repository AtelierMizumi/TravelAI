package com.travelai.core.repository;

import com.travelai.core.model.entity.Tour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {

    @Query("SELECT t FROM Tour t LEFT JOIN t.location l WHERE " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                 OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                 OR LOWER(t.highlights) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:locationId IS NULL OR l.id = :locationId) AND " +
           "(:province IS NULL OR LOWER(t.province) = LOWER(:province) OR LOWER(l.province) = LOWER(:province)) AND " +
           "(:maxPrice IS NULL OR t.price <= :maxPrice) AND " +
           "(:duration IS NULL OR LOWER(t.duration) LIKE LOWER(CONCAT('%', :duration, '%'))) AND " +
           "(:status IS NULL OR t.status = :status)")
    Page<Tour> searchTours(@Param("keyword") String keyword,
                           @Param("locationId") Long locationId,
                           @Param("province") String province,
                           @Param("maxPrice") BigDecimal maxPrice,
                           @Param("duration") String duration,
                           @Param("status") String status,
                           Pageable pageable);

    List<Tour> findByLocationIdAndStatus(Long locationId, String status);

    List<Tour> findByLocationId(Long locationId);

    boolean existsByTitleIgnoreCase(String title);
}
