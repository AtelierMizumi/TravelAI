package com.travelai.core.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LocationRequest {

    @NotBlank(message = "Location name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Province is required")
    @Size(min = 2, max = 100, message = "Province must be between 2 and 100 characters")
    private String province;

    private String description;

    @Size(max = 512, message = "Image URL must not exceed 512 characters")
    private String imageUrl;

    @DecimalMin(value = "-90.0", message = "Latitude must be >= -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be <= 90.0")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be >= -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be <= 180.0")
    private Double longitude;

    private String category;

    @DecimalMin(value = "0.0", message = "Rating must be >= 0.0")
    @DecimalMax(value = "5.0", message = "Rating must be <= 5.0")
    private Double rating;

    public LocationRequest() {
    }

    public LocationRequest(String name, String province, String description, String imageUrl,
                           Double latitude, Double longitude, String category, Double rating) {
        this.name = name;
        this.province = province;
        this.description = description;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
        this.category = category;
        this.rating = rating;
    }

    public static LocationRequestBuilder builder() {
        return new LocationRequestBuilder();
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

    public static class LocationRequestBuilder {
        private String name;
        private String province;
        private String description;
        private String imageUrl;
        private Double latitude;
        private Double longitude;
        private String category;
        private Double rating;

        public LocationRequestBuilder name(String name) {
            this.name = name;
            return this;
        }

        public LocationRequestBuilder province(String province) {
            this.province = province;
            return this;
        }

        public LocationRequestBuilder description(String description) {
            this.description = description;
            return this;
        }

        public LocationRequestBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public LocationRequestBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public LocationRequestBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public LocationRequestBuilder category(String category) {
            this.category = category;
            return this;
        }

        public LocationRequestBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public LocationRequest build() {
            return new LocationRequest(name, province, description, imageUrl, latitude, longitude, category, rating);
        }
    }
}
