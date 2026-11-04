package com.travelai.core.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_bookings_user_id", columnList = "user_id"),
        @Index(name = "idx_bookings_booking_code", columnList = "booking_code"),
        @Index(name = "idx_bookings_status", columnList = "status"),
        @Index(name = "idx_bookings_created_at", columnList = "created_at")
})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 32)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "booking_type", nullable = false, length = 20)
    private String bookingType; // "TOUR" or "HOTEL"

    @Column(nullable = false, length = 32)
    private String status; // "PENDING", "CONFIRMED", "PAID", "CANCELLED", "COMPLETED"

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(length = 10)
    private String currency = "VND";

    @Column(name = "contact_name", nullable = false, length = 100)
    private String contactName;

    @Column(name = "contact_email", nullable = false, length = 100)
    private String contactEmail;

    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "voucher_code", length = 64)
    private String voucherCode;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingDetail> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Booking() {
    }

    public Booking(Long id, String bookingCode, User user, String bookingType, String status,
                   BigDecimal totalAmount, String currency, String contactName, String contactEmail,
                   String contactPhone, String specialRequests, LocalDate startDate, LocalDate endDate,
                   String voucherCode, List<BookingDetail> items, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.bookingCode = bookingCode;
        this.user = user;
        this.bookingType = bookingType;
        this.status = status;
        this.totalAmount = totalAmount;
        this.currency = currency != null ? currency : "VND";
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.currency == null) {
            this.currency = "VND";
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addItem(BookingDetail detail) {
        items.add(detail);
        detail.setBooking(this);
    }

    public void removeItem(BookingDetail detail) {
        items.remove(detail);
        detail.setBooking(null);
    }

    public static BookingBuilder builder() {
        return new BookingBuilder();
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public List<BookingDetail> getItems() {
        return items;
    }

    public void setItems(List<BookingDetail> items) {
        this.items = items;
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

    public static class BookingBuilder {
        private Long id;
        private String bookingCode;
        private User user;
        private String bookingType;
        private String status = "PENDING";
        private BigDecimal totalAmount;
        private String currency = "VND";
        private String contactName;
        private String contactEmail;
        private String contactPhone;
        private String specialRequests;
        private LocalDate startDate;
        private LocalDate endDate;
        private String voucherCode;
        private List<BookingDetail> items = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public BookingBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public BookingBuilder bookingCode(String bookingCode) {
            this.bookingCode = bookingCode;
            return this;
        }

        public BookingBuilder user(User user) {
            this.user = user;
            return this;
        }

        public BookingBuilder bookingType(String bookingType) {
            this.bookingType = bookingType;
            return this;
        }

        public BookingBuilder status(String status) {
            this.status = status;
            return this;
        }

        public BookingBuilder totalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }

        public BookingBuilder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public BookingBuilder contactName(String contactName) {
            this.contactName = contactName;
            return this;
        }

        public BookingBuilder contactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
            return this;
        }

        public BookingBuilder contactPhone(String contactPhone) {
            this.contactPhone = contactPhone;
            return this;
        }

        public BookingBuilder specialRequests(String specialRequests) {
            this.specialRequests = specialRequests;
            return this;
        }

        public BookingBuilder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public BookingBuilder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public BookingBuilder voucherCode(String voucherCode) {
            this.voucherCode = voucherCode;
            return this;
        }

        public BookingBuilder items(List<BookingDetail> items) {
            this.items = items;
            return this;
        }

        public BookingBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public BookingBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Booking build() {
            return new Booking(id, bookingCode, user, bookingType, status, totalAmount, currency,
                    contactName, contactEmail, contactPhone, specialRequests, startDate, endDate,
                    voucherCode, items, createdAt, updatedAt);
        }
    }
}
