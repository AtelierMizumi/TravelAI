package com.travelai.core.service;

import com.travelai.core.dto.request.UserRoleUpdateRequest;
import com.travelai.core.dto.request.UserStatusUpdateRequest;
import com.travelai.core.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {

    Page<UserResponse> getUsers(String keyword, String role, Boolean enabled, Pageable pageable);

    UserResponse getUserById(Long id);

    UserResponse updateUserStatus(Long id, Long currentAdminId, UserStatusUpdateRequest request);

    UserResponse updateUserRole(Long id, Long currentAdminId, UserRoleUpdateRequest request);
}
