package com.travelai.core.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "locations", indexes = {
    @Index(name = "idx_locations_name", columnList = "name"),
    @Index(name = "idx_locations_province", columnList = "province"),
    @Index(name = "idx_locations_category", columnList = "category")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_locations_name", columnNames = {"name"})
})
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String name;

    @Column(name = "province", nullable = false, length = 100)
    private String province;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "rating")
    private Double rating = 5.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Location() {
    }

    public Location(Long id, String name, String province, String description, String imageUrl,
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
        this.rating = rating != null ? rating : 5.0;
        this.reviewCount = reviewCount != null ? reviewCount : 0;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static LocationBuilder builder() {
        return new LocationBuilder();
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

    public static class LocationBuilder {
        private Long id;
        private String name;
        private String province;
        private String description;
        private String imageUrl;
        private Double latitude;
        private Double longitude;
        private String category;
        private Double rating = 5.0;
        private Integer reviewCount = 0;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public LocationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public LocationBuilder name(String name) {
            this.name = name;
            return this;
        }

        public LocationBuilder province(String province) {
            this.province = province;
            return this;
        }

        public LocationBuilder description(String description) {
            this.description = description;
            return this;
        }

        public LocationBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public LocationBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public LocationBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public LocationBuilder category(String category) {
            this.category = category;
            return this;
        }

        public LocationBuilder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public LocationBuilder reviewCount(Integer reviewCount) {
            this.reviewCount = reviewCount;
            return this;
        }

        public LocationBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public LocationBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Location build() {
            return new Location(id, name, province, description, imageUrl, latitude, longitude, category, rating, reviewCount, createdAt, updatedAt);
        }
    }
}
