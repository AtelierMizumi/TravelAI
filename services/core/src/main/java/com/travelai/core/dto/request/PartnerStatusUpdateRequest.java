package com.travelai.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PartnerStatusUpdateRequest {

    @NotBlank(message = "Trạng thái hoạt động không được để trống")
    @Pattern(regexp = "^(ACTIVE|INACTIVE|SUSPENDED)$", message = "Trạng thái chỉ chấp nhận: ACTIVE, INACTIVE hoặc SUSPENDED")
    private String status;

    @Size(max = 255, message = "Lý do cập nhật không vượt quá 255 ký tự")
    private String reason;

    public PartnerStatusUpdateRequest() {
    }

    public PartnerStatusUpdateRequest(String status) {
        this.status = status;
    }

    public PartnerStatusUpdateRequest(String status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
