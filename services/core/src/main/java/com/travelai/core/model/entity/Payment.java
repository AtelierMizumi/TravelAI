package com.travelai.core.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_booking_id", columnList = "booking_id"),
        @Index(name = "idx_payments_transaction_code", columnList = "transaction_code"),
        @Index(name = "idx_payments_status", columnList = "status")
})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "transaction_code", nullable = false, unique = true, length = 64)
    private String transactionCode;

    @Column(name = "payment_method", nullable = false, length = 32)
    private String paymentMethod; // "VNPAY", "MOCK_GATEWAY", "BANK_TRANSFER"

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 10)
    private String currency = "VND";

    @Column(nullable = false, length = 32)
    private String status = "PENDING"; // "PENDING", "SUCCESS", "FAILED"

    @Column(name = "transaction_ref", length = 128)
    private String transactionRef;

    @Column(name = "payment_url", length = 512)
    private String paymentUrl;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "reconciliation_status", length = 32)
    private String reconciliationStatus = "UNRECONCILED"; // "UNRECONCILED", "RECONCILED", "DISCREPANCY", "REFUNDED"

    @Column(name = "reconciled_at")
    private LocalDateTime reconciledAt;

    @Column(name = "audit_notes", columnDefinition = "TEXT")
    private String auditNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Payment() {
    }

    public Payment(Long id, Booking booking, String transactionCode, String paymentMethod,
                   BigDecimal amount, String currency, String status, String transactionRef,
                   String paymentUrl, LocalDateTime paidAt, String reconciliationStatus,
                   LocalDateTime reconciledAt, String auditNotes, LocalDateTime createdAt) {
        this.id = id;
        this.booking = booking;
        this.transactionCode = transactionCode;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.currency = currency != null ? currency : "VND";
        this.status = status != null ? status : "PENDING";
        this.transactionRef = transactionRef;
        this.paymentUrl = paymentUrl;
        this.paidAt = paidAt;
        this.reconciliationStatus = reconciliationStatus != null ? reconciliationStatus : "UNRECONCILED";
        this.reconciledAt = reconciledAt;
        this.auditNotes = auditNotes;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.currency == null) {
            this.currency = "VND";
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.reconciliationStatus == null) {
            this.reconciliationStatus = "UNRECONCILED";
        }
    }

    public static PaymentBuilder builder() {
        return new PaymentBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public void setTransactionCode(String transactionCode) {
        this.transactionCode = transactionCode;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getReconciliationStatus() {
        return reconciliationStatus;
    }

    public void setReconciliationStatus(String reconciliationStatus) {
        this.reconciliationStatus = reconciliationStatus;
    }

    public LocalDateTime getReconciledAt() {
        return reconciledAt;
    }

    public void setReconciledAt(LocalDateTime reconciledAt) {
        this.reconciledAt = reconciledAt;
    }

    public String getAuditNotes() {
        return auditNotes;
    }

    public void setAuditNotes(String auditNotes) {
        this.auditNotes = auditNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class PaymentBuilder {
        private Long id;
        private Booking booking;
        private String transactionCode;
        private String paymentMethod;
        private BigDecimal amount;
        private String currency = "VND";
        private String status = "PENDING";
        private String transactionRef;
        private String paymentUrl;
        private LocalDateTime paidAt;
        private String reconciliationStatus = "UNRECONCILED";
        private LocalDateTime reconciledAt;
        private String auditNotes;
        private LocalDateTime createdAt;

        public PaymentBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PaymentBuilder booking(Booking booking) {
            this.booking = booking;
            return this;
        }

        public PaymentBuilder transactionCode(String transactionCode) {
            this.transactionCode = transactionCode;
            return this;
        }

        public PaymentBuilder paymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
            return this;
        }

        public PaymentBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public PaymentBuilder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public PaymentBuilder status(String status) {
            this.status = status;
            return this;
        }

        public PaymentBuilder transactionRef(String transactionRef) {
            this.transactionRef = transactionRef;
            return this;
        }

        public PaymentBuilder paymentUrl(String paymentUrl) {
            this.paymentUrl = paymentUrl;
            return this;
        }

        public PaymentBuilder paidAt(LocalDateTime paidAt) {
            this.paidAt = paidAt;
            return this;
        }

        public PaymentBuilder reconciliationStatus(String reconciliationStatus) {
            this.reconciliationStatus = reconciliationStatus;
            return this;
        }

        public PaymentBuilder reconciledAt(LocalDateTime reconciledAt) {
            this.reconciledAt = reconciledAt;
            return this;
        }

        public PaymentBuilder auditNotes(String auditNotes) {
            this.auditNotes = auditNotes;
            return this;
        }

        public PaymentBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Payment build() {
            return new Payment(id, booking, transactionCode, paymentMethod, amount,
                    currency, status, transactionRef, paymentUrl, paidAt,
                    reconciliationStatus, reconciledAt, auditNotes, createdAt);
        }
    }
}

