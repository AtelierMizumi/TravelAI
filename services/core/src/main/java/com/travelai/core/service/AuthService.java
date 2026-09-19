package com.travelai.core.service;

import com.travelai.core.dto.request.LoginRequest;
import com.travelai.core.dto.request.RegisterRequest;
import com.travelai.core.dto.request.TokenRefreshRequest;
import com.travelai.core.dto.response.AuthResponse;
import com.travelai.core.dto.response.TokenRefreshResponse;
import com.travelai.core.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest registerRequest);

    AuthResponse login(LoginRequest loginRequest);

    TokenRefreshResponse refreshToken(TokenRefreshRequest refreshRequest);

    void logout(Long userId);
}
