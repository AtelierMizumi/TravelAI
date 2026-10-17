package com.travelai.core.dto.response;

import com.travelai.core.model.entity.Tour;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class TourResponse {

    private Long id;
    private String title;
    private String description;
    private Long locationId;
    private String locationName;
    private String province;
    private String duration;
    private String departureDates;
    private BigDecimal price;
    private String formattedPrice;
    private String currency;
    private Double rating;
    private Integer reviewCount;
    private String imageUrl;
    private List<String> highlights;
    private String itinerary;
    private Integer availableSlots;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TourResponse() {
    }

    public TourResponse(Long id, String title, String description, Long locationId, String locationName,
                        String province, String duration, String departureDates, BigDecimal price,
                        String formattedPrice, String currency, Double rating, Integer reviewCount,
                        String imageUrl, List<String> highlights, String itinerary,
                        Integer availableSlots, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.locationId = locationId;
        this.locationName = locationName;
        this.province = province;
        this.duration = duration;
        this.departureDates = departureDates;
        this.price = price;
        this.formattedPrice = formattedPrice;
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

    public static TourResponse fromEntity(Tour tour) {
        if (tour == null) {
            return null;
        }

        Long locId = null;
        String locName = null;
        if (tour.getLocation() != null) {
            locId = tour.getLocation().getId();
            locName = tour.getLocation().getName();
        }

        List<String> highlightList = new ArrayList<>();
        if (tour.getHighlights() != null && !tour.getHighlights().trim().isEmpty()) {
            String[] parts = tour.getHighlights().split("[,;\\n]+");
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    highlightList.add(trimmed);
                }
            }
        }

        String formatted = formatVndPrice(tour.getPrice(), tour.getCurrency());

        return new TourResponse(
                tour.getId(),
                tour.getTitle(),
                tour.getDescription(),
                locId,
                locName,
                tour.getProvince(),
                tour.getDuration(),
                tour.getDepartureDates(),
                tour.getPrice(),
                formatted,
                tour.getCurrency() != null ? tour.getCurrency() : "VND",
                tour.getRating(),
                tour.getReviewCount(),
                tour.getImageUrl(),
                highlightList,
                tour.getItinerary(),
                tour.getAvailableSlots(),
                tour.getStatus(),
                tour.getCreatedAt(),
                tour.getUpdatedAt()
        );
    }

    private static String formatVndPrice(BigDecimal price, String currency) {
        if (price == null) {
            return "0 đ";
        }
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("vi", "VN"));
        symbols.setGroupingSeparator('.');
        DecimalFormat formatter = new DecimalFormat("#,###", symbols);
        String formattedNumber = formatter.format(price);
        if ("VND".equalsIgnoreCase(currency) || currency == null) {
            return formattedNumber + " đ";
        }
        return formattedNumber + " " + currency;
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

    public String getFormattedPrice() {
        return formattedPrice;
    }

    public void setFormattedPrice(String formattedPrice) {
        this.formattedPrice = formattedPrice;
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

    public List<String> getHighlights() {
        return highlights;
    }

    public void setHighlights(List<String> highlights) {
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
}
