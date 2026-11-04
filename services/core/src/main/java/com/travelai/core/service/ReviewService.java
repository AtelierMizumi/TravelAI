package com.travelai.core.service;

import com.travelai.core.dto.request.ReviewRequest;
import com.travelai.core.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    Page<ReviewResponse> getReviewsByLocation(Long locationId, Pageable pageable);

    Page<ReviewResponse> getReviewsByTour(Long tourId, Pageable pageable);

    ReviewResponse getReviewById(Long id);

    ReviewResponse createReview(Long userId, ReviewRequest request);

    ReviewResponse updateReview(Long id, Long currentUserId, boolean isAdmin, ReviewRequest request);

    void deleteReview(Long id, Long currentUserId, boolean isAdmin);
}
