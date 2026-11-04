package com.travelai.core.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class HotelRequest {

    @NotBlank(message = "Tên khách sạn không được để trống")
    @Size(max = 200, message = "Tên khách sạn không được vượt quá 200 ký tự")
    private String name;

    private String description;

    private Long locationId;

    @Size(max = 100, message = "Tỉnh/thành phố không được vượt quá 100 ký tự")
    private String province;

    @Size(max = 255, message = "Địa chỉ chi tiết không được vượt quá 255 ký tự")
    private String address;

    @Min(value = 1, message = "Tiêu chuẩn sao từ 1 đến 5 sao")
    @Max(value = 5, message = "Tiêu chuẩn sao từ 1 đến 5 sao")
    private Integer stars = 3;

    @NotNull(message = "Giá phòng mỗi đêm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá phòng phải lớn hơn 0")
    private BigDecimal pricePerNight;

    @Size(max = 10, message = "Đơn vị tiền tệ không vượt quá 10 ký tự")
    private String currency = "VND";

    @Size(max = 512, message = "URL hình ảnh không vượt quá 512 ký tự")
    private String imageUrl;

    private String amenities;

    @Size(max = 20, message = "Số điện thoại không vượt quá 20 ký tự")
    private String phone;

    @Size(max = 100, message = "Email không vượt quá 100 ký tự")
    private String email;

    private Integer availableRooms = 10;

    private String status = "ACTIVE";

    public HotelRequest() {
    }

    public HotelRequest(String name, String description, Long locationId, String province,
                        String address, Integer stars, BigDecimal pricePerNight, String currency,
                        String imageUrl, String amenities, String phone, String email,
                        Integer availableRooms, String status) {
        this.name = name;
        this.description = description;
        this.locationId = locationId;
        this.province = province;
        this.address = address;
        this.stars = stars;
        this.pricePerNight = pricePerNight;
        this.currency = currency;
        this.imageUrl = imageUrl;
        this.amenities = amenities;
        this.phone = phone;
        this.email = email;
        this.availableRooms = availableRooms;
        this.status = status;
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
}
