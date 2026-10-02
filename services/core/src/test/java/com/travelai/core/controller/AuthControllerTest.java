package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.LoginRequest;
import com.travelai.core.dto.request.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/v1/health should return UP")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", is("travelai-core-backend")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register should create user and return 201 Created")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("traveler_duc")
                .email("duc.traveler@example.com")
                .password("Password123!")
                .fullName("Hoàng Văn Đức")
                .phone("0901234567")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("traveler_duc")))
                .andExpect(jsonPath("$.email", is("duc.traveler@example.com")))
                .andExpect(jsonPath("$.role", is("ROLE_USER")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register with duplicate username should return 400 Bad Request RFC 7807")
    void testRegisterDuplicateUsername() throws Exception {
        RegisterRequest request1 = RegisterRequest.builder()
                .username("duplicate_user")
                .email("user1@example.com")
                .password("Password123!")
                .fullName("User One")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)));

        RegisterRequest request2 = RegisterRequest.builder()
                .username("duplicate_user")
                .email("user2@example.com")
                .password("Password123!")
                .fullName("User Two")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type", is("https://travelai.vn/errors/bad-request")))
                .andExpect(jsonPath("$.detail", containsString("Username is already taken!")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login should authenticate and return JWT token")
    void testLoginSuccess() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("auth_tester")
                .email("tester@example.com")
                .password("SecureSecret999!")
                .fullName("Auth Tester")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)));

        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("auth_tester")
                .password("SecureSecret999!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.user.username", is("auth_tester")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login with invalid password should return 401 Unauthorized RFC 7807")
    void testLoginInvalidCredentials() throws Exception {
        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("non_existent_user")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.type", is("https://travelai.vn/errors/unauthorized")))
                .andExpect(result -> {
                    String contentType = result.getResponse().getContentType();
                    assert contentType != null && contentType.contains("application/problem+json");
                });
    }

    @Test
    @DisplayName("POST /api/v1/auth/refresh should rotate refresh token and issue new access token")
    void testRefreshTokenRotationSuccess() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("rotation_user")
                .email("rotation@example.com")
                .password("Password123!")
                .fullName("Rotation User")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)));

        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("rotation_user")
                .password("Password123!")
                .build();

        String loginResponseStr = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        com.travelai.core.dto.response.AuthResponse authResponse =
                objectMapper.readValue(loginResponseStr, com.travelai.core.dto.response.AuthResponse.class);
        String initialRefreshToken = authResponse.getRefreshToken();

        // Perform token refresh
        com.travelai.core.dto.request.TokenRefreshRequest refreshReq =
                new com.travelai.core.dto.request.TokenRefreshRequest(initialRefreshToken);

        String refreshResponseStr = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", not(is(initialRefreshToken))))
                .andReturn().getResponse().getContentAsString();

        com.travelai.core.dto.response.TokenRefreshResponse refreshResponse =
                objectMapper.readValue(refreshResponseStr, com.travelai.core.dto.response.TokenRefreshResponse.class);

        // Attempting to reuse the original (now rotated/invalidated) token must fail
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type", is("https://travelai.vn/errors/bad-request")));

        // Refresh with the newly issued token must succeed and rotate again
        com.travelai.core.dto.request.TokenRefreshRequest secondRefreshReq =
                new com.travelai.core.dto.request.TokenRefreshRequest(refreshResponse.getRefreshToken());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondRefreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.refreshToken", not(is(refreshResponse.getRefreshToken()))));
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout without authentication should return 401 Unauthorized")
    void testLogoutUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.type", is("https://travelai.vn/errors/unauthorized")))
                .andExpect(result -> {
                    String contentType = result.getResponse().getContentType();
                    assert contentType != null && contentType.contains("application/problem+json");
                });
    }

    @Test
    @DisplayName("POST /api/v1/auth/logout with valid token should revoke refresh token")
    void testLogoutSuccessAndRevokesTokens() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("logout_user")
                .email("logout@example.com")
                .password("Password123!")
                .fullName("Logout User")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)));

        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("logout_user")
                .password("Password123!")
                .build();

        String loginResponseStr = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        com.travelai.core.dto.response.AuthResponse authResponse =
                objectMapper.readValue(loginResponseStr, com.travelai.core.dto.response.AuthResponse.class);

        // Perform authenticated logout
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + authResponse.getAccessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("logged out successfully")));

        // Attempting to refresh after logout must fail
        com.travelai.core.dto.request.TokenRefreshRequest refreshReq =
                new com.travelai.core.dto.request.TokenRefreshRequest(authResponse.getRefreshToken());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Case-insensitive email login and duplicate detection")
    void testCaseInsensitiveEmail() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("case_user")
                .email("MyEmail@Example.COM")
                .password("Password123!")
                .fullName("Case User")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email", is("myemail@example.com")));

        // Duplicate check with different casing
        RegisterRequest duplicateReq = RegisterRequest.builder()
                .username("different_username")
                .email("myemail@example.com")
                .password("Password123!")
                .fullName("Other User")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail", containsString("Email address is already in use!")));

        // Login with uppercase email
        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("MYEMAIL@EXAMPLE.COM")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username", is("case_user")));
    }
}
