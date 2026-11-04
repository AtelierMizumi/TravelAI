package com.travelai.core.dto.response;

import com.travelai.core.model.entity.Hotel;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class HotelResponse {

    private Long id;
    private String name;
    private String description;
    private Long locationId;
    private String locationName;
    private String province;
    private String address;
    private Integer stars;
    private BigDecimal pricePerNight;
    private String formattedPrice;
    private String currency;
    private Double rating;
    private Integer reviewCount;
    private String imageUrl;
    private List<String> amenities;
    private String phone;
    private String email;
    private Integer availableRooms;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HotelResponse() {
    }

    public HotelResponse(Long id, String name, String description, Long locationId, String locationName,
                         String province, String address, Integer stars, BigDecimal pricePerNight,
                         String formattedPrice, String currency, Double rating, Integer reviewCount,
                         String imageUrl, List<String> amenities, String phone, String email,
                         Integer availableRooms, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.locationId = locationId;
        this.locationName = locationName;
        this.province = province;
        this.address = address;
        this.stars = stars;
        this.pricePerNight = pricePerNight;
        this.formattedPrice = formattedPrice;
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

    public static HotelResponse fromEntity(Hotel hotel) {
        if (hotel == null) {
            return null;
        }

        Long locId = null;
        String locName = null;
        if (hotel.getLocation() != null) {
            locId = hotel.getLocation().getId();
            locName = hotel.getLocation().getName();
        }

        List<String> amenityList = new ArrayList<>();
        if (hotel.getAmenities() != null && !hotel.getAmenities().trim().isEmpty()) {
            String[] parts = hotel.getAmenities().split("[,;\\n]+");
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    amenityList.add(trimmed);
                }
            }
        }

        String formatted = formatVndPrice(hotel.getPricePerNight(), hotel.getCurrency());

        return new HotelResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getDescription(),
                locId,
                locName,
                hotel.getProvince(),
                hotel.getAddress(),
                hotel.getStars(),
                hotel.getPricePerNight(),
                formatted,
                hotel.getCurrency() != null ? hotel.getCurrency() : "VND",
                hotel.getRating(),
                hotel.getReviewCount(),
                hotel.getImageUrl(),
                amenityList,
                hotel.getPhone(),
                hotel.getEmail(),
                hotel.getAvailableRooms(),
                hotel.getStatus(),
                hotel.getCreatedAt(),
                hotel.getUpdatedAt()
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

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
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
}
