package com.travelai.core.controller;

import com.travelai.core.dto.request.UserRoleUpdateRequest;
import com.travelai.core.dto.request.UserStatusUpdateRequest;
import com.travelai.core.dto.response.UserResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.UserRepository;
import com.travelai.core.security.UserPrincipal;
import com.travelai.core.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final UserRepository userRepository;

    public AdminUserController(AdminUserService adminUserService, UserRepository userRepository) {
        this.adminUserService = adminUserService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserResponse> users = adminUserService.getUsers(keyword, role, enabled, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = adminUserService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody UserStatusUpdateRequest request
    ) {
        Long currentAdminId = resolveUserId(principal);
        UserResponse updated = adminUserService.updateUserStatus(id, currentAdminId, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal,
            @Valid @RequestBody UserRoleUpdateRequest request
    ) {
        Long currentAdminId = resolveUserId(principal);
        UserResponse updated = adminUserService.updateUserRole(id, currentAdminId, request);
        return ResponseEntity.ok(updated);
    }

    private Long resolveUserId(Object principal) {
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getId();
        } else if (principal instanceof UserDetails userDetails) {
            return userRepository.findByUsernameOrEmail(userDetails.getUsername(), userDetails.getUsername())
                    .map(User::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + userDetails.getUsername()));
        } else if (principal instanceof String username) {
            return userRepository.findByUsernameOrEmail(username, username)
                    .map(User::getId)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + username));
        }
        throw new BadRequestException("Không thể xác thực danh tính quản trị viên!");
    }
}
