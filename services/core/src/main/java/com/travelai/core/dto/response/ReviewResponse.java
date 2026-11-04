package com.travelai.core.dto.response;

import com.travelai.core.model.entity.Review;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ReviewResponse {

    private Long id;
    private Long userId;
    private String username;
    private String userFullName;
    private String userAvatar;
    private Long locationId;
    private String locationName;
    private Long tourId;
    private String tourTitle;
    private Integer rating;
    private String comment;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewResponse() {
    }

    public ReviewResponse(Long id, Long userId, String username, String userFullName, String userAvatar,
                          Long locationId, String locationName, Long tourId, String tourTitle,
                          Integer rating, String comment, List<String> images,
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.userFullName = userFullName;
        this.userAvatar = userAvatar;
        this.locationId = locationId;
        this.locationName = locationName;
        this.tourId = tourId;
        this.tourTitle = tourTitle;
        this.rating = rating;
        this.comment = comment;
        this.images = images;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ReviewResponse fromEntity(Review review) {
        if (review == null) {
            return null;
        }

        Long userId = null;
        String username = null;
        String userFullName = null;
        String userAvatar = null;
        if (review.getUser() != null) {
            userId = review.getUser().getId();
            username = review.getUser().getUsername();
            userFullName = review.getUser().getFullName();
            userAvatar = review.getUser().getAvatarUrl();
        }

        Long locationId = null;
        String locationName = null;
        if (review.getLocation() != null) {
            locationId = review.getLocation().getId();
            locationName = review.getLocation().getName();
        }

        Long tourId = null;
        String tourTitle = null;
        if (review.getTour() != null) {
            tourId = review.getTour().getId();
            tourTitle = review.getTour().getTitle();
        }

        List<String> imageList = new ArrayList<>();
        if (review.getImages() != null && !review.getImages().trim().isEmpty()) {
            String[] parts = review.getImages().split("[,;\\n]+");
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    imageList.add(trimmed);
                }
            }
        }

        return new ReviewResponse(
                review.getId(),
                userId,
                username,
                userFullName,
                userAvatar,
                locationId,
                locationName,
                tourId,
                tourTitle,
                review.getRating(),
                review.getComment(),
                imageList,
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public Long getTourId() {
        return tourId;
    }

    public void setTourId(Long tourId) {
        this.tourId = tourId;
    }

    public String getTourTitle() {
        return tourTitle;
    }

    public void setTourTitle(String tourTitle) {
        this.tourTitle = tourTitle;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
