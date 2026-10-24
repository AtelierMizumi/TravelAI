package com.travelai.core.controller;

import com.travelai.core.dto.request.ReviewRequest;
import com.travelai.core.dto.response.ReviewResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.UserRepository;
import com.travelai.core.security.UserPrincipal;
import com.travelai.core.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    public ReviewController(ReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @GetMapping("/locations/{locationId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByLocation(
            @PathVariable Long locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ReviewResponse> reviews = reviewService.getReviewsByLocation(locationId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/tours/{tourId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviewsByTour(
            @PathVariable Long tourId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ReviewResponse> reviews = reviewService.getReviewsByTour(tourId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(@PathVariable Long id) {
        ReviewResponse review = reviewService.getReviewById(id);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/locations/{locationId}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> createLocationReview(
            @PathVariable Long locationId,
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody ReviewRequest request
    ) {
        Long userId = resolveUserId(principal);
        request.setLocationId(locationId);
        ReviewResponse created = reviewService.createReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/tours/{tourId}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> createTourReview(
            @PathVariable Long tourId,
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody ReviewRequest request
    ) {
        Long userId = resolveUserId(principal);
        request.setTourId(tourId);
        ReviewResponse created = reviewService.createReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/reviews")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> createGenericReview(
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody ReviewRequest request
    ) {
        Long userId = resolveUserId(principal);
        ReviewResponse created = reviewService.createReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/reviews/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request
    ) {
        Long userId = resolveUserId(principal);
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        ReviewResponse updated = reviewService.updateReview(id, userId, isAdmin, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/reviews/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            Authentication authentication
    ) {
        Long userId = resolveUserId(principal);
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.deleteReview(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(Object principal) {
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        } else if (principal instanceof UserDetails userDetails) {
            return userRepository.findByUsernameOrEmail(userDetails.getUsername(), userDetails.getUsername())
                    .map(User::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getUsername()));
        } else if (principal instanceof String username) {
            return userRepository.findByUsernameOrEmail(username, username)
                    .map(User::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        }
        throw new BadRequestException("Không thể xác thực danh tính người dùng!");
    }
}
