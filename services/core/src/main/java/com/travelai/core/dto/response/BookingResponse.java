package com.travelai.core.dto.response;

import com.travelai.core.model.entity.Booking;
import com.travelai.core.model.entity.Payment;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class BookingResponse {

    private Long id;
    private String bookingCode;
    private Long userId;
    private String username;
    private String bookingType;
    private String status;
    private BigDecimal totalAmount;
    private String formattedTotalAmount;
    private String currency;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String specialRequests;
    private LocalDate startDate;
    private LocalDate endDate;
    private String voucherCode;
    private List<BookingDetailResponse> items = new ArrayList<>();
    private PaymentResponse payment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BookingResponse() {
    }

    public BookingResponse(Long id, String bookingCode, Long userId, String username, String bookingType,
                           String status, BigDecimal totalAmount, String formattedTotalAmount,
                           String currency, String contactName, String contactEmail, String contactPhone,
                           String specialRequests, LocalDate startDate, LocalDate endDate,
                           String voucherCode, List<BookingDetailResponse> items, PaymentResponse payment,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.bookingCode = bookingCode;
        this.userId = userId;
        this.username = username;
        this.bookingType = bookingType;
        this.status = status;
        this.totalAmount = totalAmount;
        this.formattedTotalAmount = formattedTotalAmount;
        this.currency = currency;
        this.contactName = contactName;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.specialRequests = specialRequests;
        this.startDate = startDate;
        this.endDate = endDate;
        this.voucherCode = voucherCode;
        if (items != null) {
            this.items = items;
        }
        this.payment = payment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static BookingResponse fromEntity(Booking booking, Payment payment) {
        if (booking == null) {
            return null;
        }

        List<BookingDetailResponse> detailResponses = new ArrayList<>();
        if (booking.getItems() != null) {
            for (var item : booking.getItems()) {
                detailResponses.add(BookingDetailResponse.fromEntity(item));
            }
        }

        Long userId = booking.getUser() != null ? booking.getUser().getId() : null;
        String username = booking.getUser() != null ? booking.getUser().getUsername() : null;

        return new BookingResponse(
                booking.getId(),
                booking.getBookingCode(),
                userId,
                username,
                booking.getBookingType(),
                booking.getStatus(),
                booking.getTotalAmount(),
                formatVndPrice(booking.getTotalAmount()),
                booking.getCurrency(),
                booking.getContactName(),
                booking.getContactEmail(),
                booking.getContactPhone(),
                booking.getSpecialRequests(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getVoucherCode(),
                detailResponses,
                PaymentResponse.fromEntity(payment),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }

    private static String formatVndPrice(BigDecimal amount) {
        if (amount == null) {
            return "0 đ";
        }
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " đ";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getBookingType() {
        return bookingType;
    }

    public void setBookingType(String bookingType) {
        this.bookingType = bookingType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getFormattedTotalAmount() {
        return formattedTotalAmount;
    }

    public void setFormattedTotalAmount(String formattedTotalAmount) {
        this.formattedTotalAmount = formattedTotalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
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

    public String getVoucherCode() {
        return voucherCode;
    }

    public void setVoucherCode(String voucherCode) {
        this.voucherCode = voucherCode;
    }

    public List<BookingDetailResponse> getItems() {
        return items;
    }

    public void setItems(List<BookingDetailResponse> items) {
        this.items = items;
    }

    public PaymentResponse getPayment() {
        return payment;
    }

    public void setPayment(PaymentResponse payment) {
        this.payment = payment;
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
