package com.travelai.core.repository;

import com.travelai.core.model.entity.RoleName;
import com.travelai.core.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"role"})
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"role"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"role"})
    Optional<User> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN u.role r WHERE " +
           "(:keyword IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                 OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                 OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "                 OR (u.phone IS NOT NULL AND u.phone LIKE CONCAT('%', :keyword, '%'))) AND " +
           "(:roleName IS NULL OR r.name = :roleName) AND " +
           "(:enabled IS NULL OR u.enabled = :enabled)")
    Page<User> searchUsers(@Param("keyword") String keyword,
                           @Param("roleName") RoleName roleName,
                           @Param("enabled") Boolean enabled,
                           Pageable pageable);
}
