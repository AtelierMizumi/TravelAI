package com.travelai.core.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserStatusUpdateRequest {

    @NotNull(message = "Trạng thái kích hoạt (enabled) không được để trống")
    private Boolean enabled;

    @Size(max = 255, message = "Lý do thay đổi trạng thái không được vượt quá 255 ký tự")
    private String reason;

    public UserStatusUpdateRequest() {
    }

    public UserStatusUpdateRequest(Boolean enabled, String reason) {
        this.enabled = enabled;
        this.reason = reason;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
