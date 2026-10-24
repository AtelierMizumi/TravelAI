package com.travelai.core.dto.request;

public class PaymentProcessRequest {

    private String paymentMethod = "MOCK_GATEWAY"; // "VNPAY", "MOCK_GATEWAY", "BANK_TRANSFER"

    private Boolean simulateSuccess = true;

    public PaymentProcessRequest() {
    }

    public PaymentProcessRequest(String paymentMethod, Boolean simulateSuccess) {
        this.paymentMethod = paymentMethod != null ? paymentMethod : "MOCK_GATEWAY";
        this.simulateSuccess = simulateSuccess != null ? simulateSuccess : true;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Boolean getSimulateSuccess() {
        return simulateSuccess;
    }

    public void setSimulateSuccess(Boolean simulateSuccess) {
        this.simulateSuccess = simulateSuccess;
    }
}
