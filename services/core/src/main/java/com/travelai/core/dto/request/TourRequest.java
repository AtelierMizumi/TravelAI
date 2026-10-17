package com.travelai.core.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class TourRequest {

    @NotBlank(message = "Tour title is required and cannot be blank")
    @Size(max = 200, message = "Tour title must not exceed 200 characters")
    private String title;

    private String description;

    private Long locationId;

    @Size(max = 100, message = "Province must not exceed 100 characters")
    private String province;

    @NotBlank(message = "Tour duration is required (e.g., '1 ngày', '2 ngày 1 đêm')")
    @Size(max = 50, message = "Duration must not exceed 50 characters")
    private String duration;

    @Size(max = 255, message = "Departure dates information must not exceed 255 characters")
    private String departureDates;

    @NotNull(message = "Tour price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Tour price must be greater than zero")
    private BigDecimal price;

    @Size(max = 10, message = "Currency code must not exceed 10 characters")
    private String currency = "VND";

    @Size(max = 512, message = "Image URL must not exceed 512 characters")
    private String imageUrl;

    private String highlights;

    private String itinerary;

    private Integer availableSlots = 20;

    private String status = "ACTIVE";

    public TourRequest() {
    }

    public TourRequest(String title, String description, Long locationId, String province,
                       String duration, String departureDates, BigDecimal price,
                       String currency, String imageUrl, String highlights,
                       String itinerary, Integer availableSlots, String status) {
        this.title = title;
        this.description = description;
        this.locationId = locationId;
        this.province = province;
        this.duration = duration;
        this.departureDates = departureDates;
        this.price = price;
        this.currency = currency;
        this.imageUrl = imageUrl;
        this.highlights = highlights;
        this.itinerary = itinerary;
        this.availableSlots = availableSlots;
        this.status = status;
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

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
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
}
