package com.travelai.backend.repository;

import com.travelai.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByStatusOrderByCreatedAtDesc(String status);

    List<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
            "update Post set shareCount = coalesce(shareCount, 0) + 1 where id = :postId")
    void incrementShareCount(@org.springframework.data.repository.query.Param("postId") Long postId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
            "update Post set shareCount = greatest(0, coalesce(shareCount, 0) - 1) where id = :postId")
    void decrementShareCount(@org.springframework.data.repository.query.Param("postId") Long postId);
}