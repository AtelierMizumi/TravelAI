package com.travelai.backend.repository;

import com.travelai.backend.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Long countByPostId(Long postId);

    Optional<PostLike> findByPostIdAndUserId(
            Long postId,
            Long userId
    );

    void deleteByPostIdAndUserId(
            Long postId,
            Long userId
    );
}