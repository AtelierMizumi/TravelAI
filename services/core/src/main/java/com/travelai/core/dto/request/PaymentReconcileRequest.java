package com.travelai.core.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PaymentReconcileRequest {

    @NotBlank(message = "Trạng thái đối soát không được để trống (RECONCILED, DISCREPANCY, REFUNDED)")
    private String reconciliationStatus;

    private String transactionRef;

    private String auditNotes;

    public PaymentReconcileRequest() {
    }

    public PaymentReconcileRequest(String reconciliationStatus, String transactionRef, String auditNotes) {
        this.reconciliationStatus = reconciliationStatus;
        this.transactionRef = transactionRef;
        this.auditNotes = auditNotes;
    }

    public String getReconciliationStatus() {
        return reconciliationStatus;
    }

    public void setReconciliationStatus(String reconciliationStatus) {
        this.reconciliationStatus = reconciliationStatus;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public String getAuditNotes() {
        return auditNotes;
    }

    public void setAuditNotes(String auditNotes) {
        this.auditNotes = auditNotes;
    }
}
