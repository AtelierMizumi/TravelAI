package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.UserRoleUpdateRequest;
import com.travelai.core.dto.request.UserStatusUpdateRequest;
import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.RoleRepository;
import com.travelai.core.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminMaster;
    private User normalUser;

    @BeforeEach
    void setUp() {
        Role roleAdmin = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ADMIN)));
        Role roleUser = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));

        adminMaster = userRepository.findByUsername("admin_master").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("admin_master")
                        .email("admin_master@travelai.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Master Admin")
                        .role(roleAdmin)
                        .enabled(true)
                        .build())
        );
        adminMaster.setEnabled(true);
        adminMaster.setRole(roleAdmin);
        adminMaster = userRepository.save(adminMaster);

        normalUser = userRepository.findByUsername("traveler_target").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("traveler_target")
                        .email("traveler_target@travelai.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Target Traveler")
                        .role(roleUser)
                        .enabled(true)
                        .build())
        );
        normalUser.setEnabled(true);
        normalUser.setRole(roleUser);
        normalUser = userRepository.save(normalUser);
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/users should return paged user list for Admin")
    void testGetUsers_AdminSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].username", notNullValue()))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(2)));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/users with keyword filter should filter users correctly")
    void testGetUsers_WithKeywordFilter() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .param("keyword", "traveler_target")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].username", is("traveler_target")));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/users with role filter should filter by role")
    void testGetUsers_WithRoleFilter() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .param("role", "ROLE_USER")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/users with enabled filter should filter by status")
    void testGetUsers_WithEnabledFilter() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .param("enabled", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())));
    }

    @Test
    @WithMockUser(username = "traveler_target", roles = {"USER"})
    @DisplayName("GET /api/v1/admin/users by regular USER should return 403 Forbidden")
    void testGetUsers_ForbiddenForRegularUser() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/admin/users unauthenticated should return 401 Unauthorized")
    void testGetUsers_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/users/{id} should return user details")
    void testGetUserById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/{id}", normalUser.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(normalUser.getId().intValue())))
                .andExpect(jsonPath("$.username", is("traveler_target")))
                .andExpect(jsonPath("$.email", is("traveler_target@travelai.com")))
                .andExpect(jsonPath("$.enabled", is(true)));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/users/{id} should return 404 when user not found")
    void testGetUserById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/users/{id}/status should disable target user")
    void testUpdateUserStatus_DisableUserSuccess() throws Exception {
        UserStatusUpdateRequest request = new UserStatusUpdateRequest(false, "Vi phạm điều khoản cộng đồng");

        mockMvc.perform(put("/api/v1/admin/users/{id}/status", normalUser.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(normalUser.getId().intValue())))
                .andExpect(jsonPath("$.enabled", is(false)));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/users/{id}/status should reject admin self-lock")
    void testUpdateUserStatus_SelfLockRejection() throws Exception {
        UserStatusUpdateRequest request = new UserStatusUpdateRequest(false, "Thử tự khóa tài khoản");

        mockMvc.perform(put("/api/v1/admin/users/{id}/status", adminMaster.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detail", containsString("Bạn không thể tự vô hiệu hóa tài khoản quản trị viên của chính mình")));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/users/{id}/role should promote user to ROLE_ADMIN")
    void testUpdateUserRole_PromoteToAdminSuccess() throws Exception {
        UserRoleUpdateRequest request = new UserRoleUpdateRequest("ROLE_ADMIN");

        mockMvc.perform(put("/api/v1/admin/users/{id}/role", normalUser.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(normalUser.getId().intValue())))
                .andExpect(jsonPath("$.role", is("ROLE_ADMIN")));
    }

    @Test
    @WithMockUser(username = "admin_master", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/users/{id}/role should reject admin self-demotion")
    void testUpdateUserRole_SelfDemoteRejection() throws Exception {
        UserRoleUpdateRequest request = new UserRoleUpdateRequest("ROLE_USER");

        mockMvc.perform(put("/api/v1/admin/users/{id}/role", adminMaster.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detail", containsString("Bạn không thể tự thu hồi quyền quản trị của chính mình")));
    }
}
