package com.travelai.core.service.impl;

import com.travelai.core.dto.request.LoginRequest;
import com.travelai.core.dto.request.RegisterRequest;
import com.travelai.core.dto.request.TokenRefreshRequest;
import com.travelai.core.dto.response.AuthResponse;
import com.travelai.core.dto.response.TokenRefreshResponse;
import com.travelai.core.dto.response.UserResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.RefreshToken;
import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.RoleRepository;
import com.travelai.core.repository.UserRepository;
import com.travelai.core.security.JwtTokenProvider;
import com.travelai.core.security.UserPrincipal;
import com.travelai.core.service.AuthService;
import com.travelai.core.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest registerRequest) {
        String normalizedUsername = registerRequest.getUsername() != null ? registerRequest.getUsername().trim() : "";
        String normalizedEmail = registerRequest.getEmail() != null ? registerRequest.getEmail().trim().toLowerCase() : "";

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email address is already in use!");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleName.ROLE_USER).build()));

        User user = User.builder()
                .username(normalizedUsername)
                .email(normalizedEmail)
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName() != null ? registerRequest.getFullName().trim() : "")
                .phone(registerRequest.getPhone())
                .role(userRole)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user with username: {}", savedUser.getUsername());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        String loginIdentifier = loginRequest.getUsernameOrEmail() != null ? loginRequest.getUsernameOrEmail().trim() : "";
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginIdentifier,
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String accessToken = tokenProvider.generateToken(authentication);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userPrincipal.getId()));

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationInMs())
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest refreshRequest) {
        String requestRefreshToken = refreshRequest.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    if (!Boolean.TRUE.equals(user.getEnabled())) {
                        throw new BadRequestException("User account is disabled!");
                    }
                    UserPrincipal userPrincipal = UserPrincipal.create(user);
                    Authentication auth = new UsernamePasswordAuthenticationToken(
                            userPrincipal, null, userPrincipal.getAuthorities());
                    String token = tokenProvider.generateTokenFromUsername(user.getUsername(), auth);

                    // Enforce Refresh Token Rotation (RTR): revoke current token and issue replacement
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

                    return TokenRefreshResponse.builder()
                            .accessToken(token)
                            .refreshToken(newRefreshToken.getToken())
                            .tokenType("Bearer")
                            .expiresIn(tokenProvider.getExpirationInMs())
                            .build();
                })
                .orElseThrow(() -> new BadRequestException("Refresh token is not registered in system!"));
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        refreshTokenService.deleteByUserId(userId);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .role(user.getRole().getName().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
