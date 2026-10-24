package com.travelai.core.dto.response;

import com.travelai.core.model.entity.Payment;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.Locale;

public class PaymentResponse {

    private Long id;
    private String transactionCode;
    private String paymentMethod;
    private BigDecimal amount;
    private String formattedAmount;
    private String currency;
    private String status;
    private String transactionRef;
    private String paymentUrl;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public PaymentResponse() {
    }

    public PaymentResponse(Long id, String transactionCode, String paymentMethod, BigDecimal amount,
                           String formattedAmount, String currency, String status, String transactionRef,
                           String paymentUrl, LocalDateTime paidAt, LocalDateTime createdAt) {
        this.id = id;
        this.transactionCode = transactionCode;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.formattedAmount = formattedAmount;
        this.currency = currency;
        this.status = status;
        this.transactionRef = transactionRef;
        this.paymentUrl = paymentUrl;
        this.paidAt = paidAt;
        this.createdAt = createdAt;
    }

    public static PaymentResponse fromEntity(Payment payment) {
        if (payment == null) {
            return null;
        }

        return new PaymentResponse(
                payment.getId(),
                payment.getTransactionCode(),
                payment.getPaymentMethod(),
                payment.getAmount(),
                formatVndPrice(payment.getAmount()),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getTransactionRef(),
                payment.getPaymentUrl(),
                payment.getPaidAt(),
                payment.getCreatedAt()
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

    public String getFormattedAmount() {
        return formattedAmount;
    }

    public void setFormattedAmount(String formattedAmount) {
        this.formattedAmount = formattedAmount;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
