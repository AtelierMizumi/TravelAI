package com.travelai.core.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BookingCreateRequest {

    @NotBlank(message = "Loại đặt chỗ không được để trống (TOUR hoặc HOTEL)")
    private String bookingType; // "TOUR" or "HOTEL"

    private Long tourId;

    private Long hotelId;

    @NotNull(message = "Ngày bắt đầu/nhận phòng không được để trống")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "Số lượng khách/phòng không được để trống")
    @Min(value = 1, message = "Số lượng tối thiểu là 1")
    private Integer quantity = 1;

    @Min(value = 1, message = "Số đêm nghỉ tối thiểu là 1")
    private Integer numberOfNights = 1;

    @NotBlank(message = "Họ tên người liên hệ không được để trống")
    private String contactName;

    @NotBlank(message = "Email người liên hệ không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String contactEmail;

    @NotBlank(message = "Số điện thoại người liên hệ không được để trống")
    private String contactPhone;

    private String specialRequests;

    private String paymentMethod = "MOCK_GATEWAY";

    public BookingCreateRequest() {
    }

    public BookingCreateRequest(String bookingType, Long tourId, Long hotelId, LocalDate startDate,
                                LocalDate endDate, Integer quantity, Integer numberOfNights,
                                String contactName, String contactEmail, String contactPhone,
                                String specialRequests, String paymentMethod) {
        this.bookingType = bookingType;
        this.tourId = tourId;
        this.hotelId = hotelId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.quantity = quantity;
        this.numberOfNights = numberOfNights != null ? numberOfNights : 1;
        this.contactName = contactName;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.specialRequests = specialRequests;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "MOCK_GATEWAY";
    }

    public String getBookingType() {
        return bookingType;
    }

    public void setBookingType(String bookingType) {
        this.bookingType = bookingType;
    }

    public Long getTourId() {
        return tourId;
    }

    public void setTourId(Long tourId) {
        this.tourId = tourId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getNumberOfNights() {
        return numberOfNights;
    }

    public void setNumberOfNights(Integer numberOfNights) {
        this.numberOfNights = numberOfNights;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
