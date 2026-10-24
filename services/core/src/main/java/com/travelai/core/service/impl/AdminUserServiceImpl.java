package com.travelai.core.service.impl;

import com.travelai.core.dto.request.UserRoleUpdateRequest;
import com.travelai.core.dto.request.UserStatusUpdateRequest;
import com.travelai.core.dto.response.UserResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.RoleRepository;
import com.travelai.core.repository.UserRepository;
import com.travelai.core.service.AdminUserService;
import com.travelai.core.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private static final Logger log = LoggerFactory.getLogger(AdminUserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenService refreshTokenService;

    public AdminUserServiceImpl(UserRepository userRepository,
                                RoleRepository roleRepository,
                                RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String keyword, String role, Boolean enabled, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        RoleName roleName = null;
        if (role != null && !role.trim().isEmpty()) {
            String roleUpper = role.trim().toUpperCase();
            if (!roleUpper.startsWith("ROLE_")) {
                roleUpper = "ROLE_" + roleUpper;
            }
            try {
                roleName = RoleName.valueOf(roleUpper);
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Tên vai trò không hợp lệ: " + role);
            }
        }

        return userRepository.searchUsers(cleanKeyword, roleName, enabled, pageable)
                .map(UserResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, Long currentAdminId, UserStatusUpdateRequest request) {
        if (id.equals(currentAdminId) && Boolean.FALSE.equals(request.getEnabled())) {
            throw new BadRequestException("Bạn không thể tự vô hiệu hóa tài khoản quản trị viên của chính mình!");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        boolean wasEnabled = Boolean.TRUE.equals(user.getEnabled());
        user.setEnabled(request.getEnabled());
        User saved = userRepository.save(user);

        if (Boolean.FALSE.equals(request.getEnabled())) {
            int revokedCount = refreshTokenService.deleteByUserId(id);
            log.warn("Admin id={} disabled user id={} username='{}'. Revoked {} active refresh tokens. Reason: {}",
                    currentAdminId, id, user.getUsername(), revokedCount, request.getReason());
        } else if (!wasEnabled && Boolean.TRUE.equals(request.getEnabled())) {
            log.info("Admin id={} re-enabled user id={} username='{}'. Reason: {}",
                    currentAdminId, id, user.getUsername(), request.getReason());
        }

        return UserResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long id, Long currentAdminId, UserRoleUpdateRequest request) {
        String roleStr = request.getRole().trim().toUpperCase();
        if (!roleStr.startsWith("ROLE_")) {
            roleStr = "ROLE_" + roleStr;
        }

        RoleName targetRoleName;
        try {
            targetRoleName = RoleName.valueOf(roleStr);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Tên vai trò không hợp lệ: " + request.getRole());
        }

        if (id.equals(currentAdminId) && targetRoleName != RoleName.ROLE_ADMIN) {
            throw new BadRequestException("Bạn không thể tự thu hồi quyền quản trị của chính mình!");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Role role = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with name: " + targetRoleName));

        user.setRole(role);
        User saved = userRepository.save(user);
        log.info("Admin id={} updated role for user id={} to {}", currentAdminId, id, targetRoleName);

        return UserResponse.fromEntity(saved);
    }
}
