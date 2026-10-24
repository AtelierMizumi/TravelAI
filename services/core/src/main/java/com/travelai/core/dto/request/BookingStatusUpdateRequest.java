package com.travelai.core.dto.request;

import jakarta.validation.constraints.NotBlank;

public class BookingStatusUpdateRequest {

    @NotBlank(message = "Trạng thái mới không được để trống (CONFIRMED, PAID, COMPLETED, CANCELLED)")
    private String status;

    private String note;

    public BookingStatusUpdateRequest() {
    }

    public BookingStatusUpdateRequest(String status, String note) {
        this.status = status;
        this.note = note;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
