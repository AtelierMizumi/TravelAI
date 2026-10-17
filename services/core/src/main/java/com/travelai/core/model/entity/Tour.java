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
@Table(name = "tours", indexes = {
    @Index(name = "idx_tours_location_id", columnList = "location_id"),
    @Index(name = "idx_tours_province", columnList = "province"),
    @Index(name = "idx_tours_price", columnList = "price"),
    @Index(name = "idx_tours_status", columnList = "status")
})
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "duration", nullable = false, length = 50)
    private String duration;

    @Column(name = "departure_dates", length = 255)
    private String departureDates;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "currency", length = 10)
    private String currency = "VND";

    @Column(name = "rating")
    private Double rating = 5.0;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "highlights", columnDefinition = "TEXT")
    private String highlights;

    @Column(name = "itinerary", columnDefinition = "TEXT")
    private String itinerary;

    @Column(name = "available_slots")
    private Integer availableSlots = 20;

    @Column(name = "status", length = 32)
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Tour() {
    }

    public Tour(Long id, String title, String description, Location location, String province,
                String duration, String departureDates, BigDecimal price, String currency,
                Double rating, Integer reviewCount, String imageUrl, String highlights,
                String itinerary, Integer availableSlots, String status,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.province = province;
        this.duration = duration;
        this.departureDates = departureDates;
        this.price = price;
        this.currency = currency;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.imageUrl = imageUrl;
        this.highlights = highlights;
        this.itinerary = itinerary;
        this.availableSlots = availableSlots;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getDepartureDates() {
        return departureDates;
    }

    public void setDepartureDates(String departureDates) {
        this.departureDates = departureDates;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
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

    public String getHighlights() {
        return highlights;
    }

    public void setHighlights(String highlights) {
        this.highlights = highlights;
    }

    public String getItinerary() {
        return itinerary;
    }

    public void setItinerary(String itinerary) {
        this.itinerary = itinerary;
    }

    public Integer getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(Integer availableSlots) {
        this.availableSlots = availableSlots;
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
        private String title;
        private String description;
        private Location location;
        private String province;
        private String duration;
        private String departureDates;
        private BigDecimal price;
        private String currency = "VND";
        private Double rating = 5.0;
        private Integer reviewCount = 0;
        private String imageUrl;
        private String highlights;
        private String itinerary;
        private Integer availableSlots = 20;
        private String status = "ACTIVE";
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
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

        public Builder duration(String duration) {
            this.duration = duration;
            return this;
        }

        public Builder departureDates(String departureDates) {
            this.departureDates = departureDates;
            return this;
        }

        public Builder price(BigDecimal price) {
            this.price = price;
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

        public Builder highlights(String highlights) {
            this.highlights = highlights;
            return this;
        }

        public Builder itinerary(String itinerary) {
            this.itinerary = itinerary;
            return this;
        }

        public Builder availableSlots(Integer availableSlots) {
            this.availableSlots = availableSlots;
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

        public Tour build() {
            return new Tour(id, title, description, location, province, duration, departureDates,
                    price, currency, rating, reviewCount, imageUrl, highlights, itinerary,
                    availableSlots, status, createdAt, updatedAt);
        }
    }
}
