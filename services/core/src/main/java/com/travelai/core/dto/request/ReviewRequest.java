package com.travelai.core.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class ReviewRequest {

    private Long locationId;

    private Long tourId;

    @NotNull(message = "Rating score is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @NotBlank(message = "Review comment cannot be blank")
    @Size(min = 5, max = 2000, message = "Review comment must be between 5 and 2000 characters")
    private String comment;

    private List<String> images = new ArrayList<>();

    public ReviewRequest() {
    }

    public ReviewRequest(Long locationId, Long tourId, Integer rating, String comment, List<String> images) {
        this.locationId = locationId;
        this.tourId = tourId;
        this.rating = rating;
        this.comment = comment;
        this.images = images != null ? images : new ArrayList<>();
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Long getTourId() {
        return tourId;
    }

    public void setTourId(Long tourId) {
        this.tourId = tourId;
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
}
