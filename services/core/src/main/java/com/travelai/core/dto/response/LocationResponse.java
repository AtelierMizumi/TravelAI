package com.travelai.core.dto.response;

import java.time.LocalDateTime;

public class LocationResponse {

    private Long id;
    private String name;
    private String province;
    private String description;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private String category;
    private Double rating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public LocationResponse() {
    }

    public LocationResponse(Long id, String name, String province, String description, String imageUrl,
                            Double latitude, Double longitude, String category, Double rating,
                            Integer reviewCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.province = province;
        this.description = description;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
        this.category = category;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static LocationResponseBuilder builder() {
        return new LocationResponseBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
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

    public static class LocationResponseBuilder {
        private Long id;
        private String name;
        private String province;
        private String description;
        private String imageUrl;
        private Double latitude;
        private Double longitude;
        private String category;
        private Double rating;
        private Integer reviewCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public LocationResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public LocationResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public LocationResponseBuilder province(String province) {
            this.province = province;
            return this;
        }

        public LocationResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public LocationResponseBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public LocationResponseBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public LocationResponseBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public LocationResponseBuilder category(String category) {
            this.category = category;
            return this;
        }

        public LocationResponseBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public LocationResponseBuilder reviewCount(Integer reviewCount) {
            this.reviewCount = reviewCount;
            return this;
        }

        public LocationResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public LocationResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public LocationResponse build() {
            return new LocationResponse(id, name, province, description, imageUrl, latitude, longitude, category, rating, reviewCount, createdAt, updatedAt);
        }
    }
}
