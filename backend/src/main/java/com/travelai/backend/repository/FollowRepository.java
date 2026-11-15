package com.travelai.backend.repository;

import com.travelai.backend.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Long countByFollowingId(Long followingId);

    Long countByFollowerId(Long followerId);

    Optional<Follow> findByFollowerIdAndFollowingId(
            Long followerId,
            Long followingId
    );
}