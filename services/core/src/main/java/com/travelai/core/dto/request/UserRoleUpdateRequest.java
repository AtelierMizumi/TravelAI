package com.travelai.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UserRoleUpdateRequest {

    @NotBlank(message = "Tên vai trò (role) không được để trống")
    @Pattern(regexp = "^(ROLE_ADMIN|ROLE_USER|ADMIN|USER)$", message = "Vai trò phải là ROLE_ADMIN hoặc ROLE_USER")
    private String role;

    public UserRoleUpdateRequest() {
    }

    public UserRoleUpdateRequest(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
