package com.travelai.backend.repository;

import com.travelai.backend.entity.Share;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShareRepository extends JpaRepository<Share, Long> {

    Long countByPostId(Long postId);
}