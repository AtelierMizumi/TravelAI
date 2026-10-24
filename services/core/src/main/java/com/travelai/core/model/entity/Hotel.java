package com.travelai.core.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotels", indexes = {
    @Index(name = "idx_hotels_location_id", columnList = "location_id"),
    @Index(name = "idx_hotels_province", columnList = "province"),
    @Index(name = "idx_hotels_stars", columnList = "stars"),
    @Index(name = "idx_hotels_price", columnList = "price_per_night"),
    @Index(name = "idx_hotels_status", columnList = "status")
})
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "stars")
    private Integer stars = 3;

    @Column(name = "price_per_night", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "currency", length = 10)
    private String currency = "VND";

    @Column(name = "rating")
    private Double rating = 5.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "available_rooms")
    private Integer availableRooms = 10;

    @Column(name = "status", length = 32)
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Hotel() {
    }

    public Hotel(Long id, String name, String description, Location location, String province,
                 String address, Integer stars, BigDecimal pricePerNight, String currency,
                 Double rating, Integer reviewCount, String imageUrl, String amenities,
                 String phone, String email, Integer availableRooms, String status,
                 LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.province = province;
        this.address = address;
        this.stars = stars;
        this.pricePerNight = pricePerNight;
        this.currency = currency;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.imageUrl = imageUrl;
        this.amenities = amenities;
        this.phone = phone;
        this.email = email;
        this.availableRooms = availableRooms;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
        if (location != null && (this.province == null || this.province.isEmpty())) {
            this.province = location.getProvince();
        }
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getStars() {
        return stars;
    }

    public void setStars(Integer stars) {
        this.stars = stars;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Integer availableRooms) {
        this.availableRooms = availableRooms;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private Location location;
        private String province;
        private String address;
        private Integer stars = 3;
        private BigDecimal pricePerNight;
        private String currency = "VND";
        private Double rating = 5.0;
        private Integer reviewCount = 0;
        private String imageUrl;
        private String amenities;
        private String phone;
        private String email;
        private Integer availableRooms = 10;
        private String status = "ACTIVE";
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder location(Location location) {
            this.location = location;
            if (location != null && (this.province == null || this.province.isEmpty())) {
                this.province = location.getProvince();
            }
            return this;
        }

        public Builder province(String province) {
            this.province = province;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder stars(Integer stars) {
            this.stars = stars;
            return this;
        }

        public Builder pricePerNight(BigDecimal pricePerNight) {
            this.pricePerNight = pricePerNight;
            return this;
        }

        public Builder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public Builder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public Builder reviewCount(Integer reviewCount) {
            this.reviewCount = reviewCount;
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Builder amenities(String amenities) {
            this.amenities = amenities;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder availableRooms(Integer availableRooms) {
            this.availableRooms = availableRooms;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Hotel build() {
            return new Hotel(id, name, description, location, province, address, stars, pricePerNight,
                    currency, rating, reviewCount, imageUrl, amenities, phone, email, availableRooms,
                    status, createdAt, updatedAt);
        }
    }
}
