package com.travelai.core.repository;

import com.travelai.core.model.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT h FROM Hotel h LEFT JOIN h.location l WHERE " +
           "(:keyword IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                  OR LOWER(h.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                  OR LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                  OR LOWER(h.amenities) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:locationId IS NULL OR l.id = :locationId) AND " +
           "(:province IS NULL OR LOWER(h.province) = LOWER(:province) OR LOWER(l.province) = LOWER(:province)) AND " +
           "(:minStars IS NULL OR h.stars >= :minStars) AND " +
           "(:maxPrice IS NULL OR h.pricePerNight <= :maxPrice) AND " +
           "(:status IS NULL OR h.status = :status)")
    Page<Hotel> searchHotels(@Param("keyword") String keyword,
                             @Param("locationId") Long locationId,
                             @Param("province") String province,
                             @Param("minStars") Integer minStars,
                             @Param("maxPrice") BigDecimal maxPrice,
                             @Param("status") String status,
                             Pageable pageable);

    List<Hotel> findByLocationIdAndStatus(Long locationId, String status);

    List<Hotel> findByLocationId(Long locationId);

    boolean existsByNameIgnoreCase(String name);
}
