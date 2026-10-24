package com.travelai.core.service.impl;

import com.travelai.core.dto.request.ReviewRequest;
import com.travelai.core.dto.response.ReviewResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Location;
import com.travelai.core.model.entity.Review;
import com.travelai.core.model.entity.Tour;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.repository.ReviewRepository;
import com.travelai.core.repository.TourRepository;
import com.travelai.core.repository.UserRepository;
import com.travelai.core.service.ReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewServiceImpl implements ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewServiceImpl.class);

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final TourRepository tourRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             UserRepository userRepository,
                             LocationRepository locationRepository,
                             TourRepository tourRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.tourRepository = tourRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByLocation(Long locationId, Pageable pageable) {
        if (!locationRepository.existsById(locationId)) {
            throw new ResourceNotFoundException("Location not found with id: " + locationId);
        }
        return reviewRepository.findByLocationId(locationId, pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByTour(Long tourId, Pageable pageable) {
        if (!tourRepository.existsById(tourId)) {
            throw new ResourceNotFoundException("Tour not found with id: " + tourId);
        }
        return reviewRepository.findByTourId(tourId, pageable)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        return ReviewResponse.fromEntity(review);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa và không thể đăng đánh giá.");
        }

        if (request.getLocationId() == null && request.getTourId() == null) {
            throw new BadRequestException("Đánh giá phải thuộc về một địa danh hoặc một tour du lịch cụ thể.");
        }

        Location location = null;
        if (request.getLocationId() != null) {
            if (reviewRepository.existsByUserIdAndLocationId(userId, request.getLocationId())) {
                throw new BadRequestException("Bạn đã đánh giá địa danh này rồi. Vui lòng cập nhật đánh giá hiện tại của bạn.");
            }
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));
        }

        Tour tour = null;
        if (request.getTourId() != null) {
            if (reviewRepository.existsByUserIdAndTourId(userId, request.getTourId())) {
                throw new BadRequestException("Bạn đã đánh giá tour này rồi. Vui lòng cập nhật đánh giá hiện tại của bạn.");
            }
            tour = tourRepository.findById(request.getTourId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + request.getTourId()));
        }

        String imagesString = null;
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            imagesString = String.join(",", request.getImages());
        }

        Review review = Review.builder()
                .user(user)
                .location(location)
                .tour(tour)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .images(imagesString)
                .build();

        Review saved = reviewRepository.save(review);
        log.info("User id={} created review id={} rating={} for locationId={} tourId={}",
                userId, saved.getId(), saved.getRating(), request.getLocationId(), request.getTourId());

        refreshAggregates(location, tour);

        return ReviewResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long id, Long currentUserId, boolean isAdmin, ReviewRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        if (!review.getUser().getId().equals(currentUserId) && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền chỉnh sửa đánh giá này!");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        if (request.getImages() != null) {
            review.setImages(String.join(",", request.getImages()));
        }

        Review updated = reviewRepository.save(review);
        log.info("Review id={} updated by user id={}", id, currentUserId);

        refreshAggregates(review.getLocation(), review.getTour());

        return ReviewResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteReview(Long id, Long currentUserId, boolean isAdmin) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        if (!review.getUser().getId().equals(currentUserId) && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xóa đánh giá này!");
        }

        Location location = review.getLocation();
        Tour tour = review.getTour();

        reviewRepository.delete(review);
        log.info("Review id={} deleted by user id={}", id, currentUserId);

        refreshAggregates(location, tour);
    }

    private void refreshAggregates(Location location, Tour tour) {
        if (location != null) {
            Double avg = reviewRepository.calculateAverageRatingByLocation(location.getId());
            Long count = reviewRepository.countByLocationId(location.getId());
            location.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0);
            location.setReviewCount(count != null ? count.intValue() : 0);
            locationRepository.save(location);
        }

        if (tour != null) {
            Double avg = reviewRepository.calculateAverageRatingByTour(tour.getId());
            Long count = reviewRepository.countByTourId(tour.getId());
            tour.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 5.0);
            tour.setReviewCount(count != null ? count.intValue() : 0);
            tourRepository.save(tour);
        }
    }
}
