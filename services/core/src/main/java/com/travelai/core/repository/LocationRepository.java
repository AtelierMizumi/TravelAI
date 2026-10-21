package com.travelai.core.repository;

import com.travelai.core.model.entity.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    Optional<Location> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT l FROM Location l WHERE " +
           "(CAST(:keyword AS string) IS NULL OR LOWER(l.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR LOWER(l.province) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
           "(CAST(:province AS string) IS NULL OR LOWER(l.province) = LOWER(CAST(:province AS string))) AND " +
           "(CAST(:category AS string) IS NULL OR LOWER(l.category) = LOWER(CAST(:category AS string)))")
    Page<Location> searchLocations(
            @Param("keyword") String keyword,
            @Param("province") String province,
            @Param("category") String category,
            Pageable pageable
    );
}
