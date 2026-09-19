package com.travelai.core.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expirationMs);
    }

    @Test
    @DisplayName("Should generate valid JWT token from username")
    void testGenerateAndValidateToken() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "duc_backend",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );

        String token = tokenProvider.generateTokenFromUsername("duc_backend", auth);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));

        String username = tokenProvider.getUsernameFromJwt(token);
        assertEquals("duc_backend", username);
    }

    @Test
    @DisplayName("Should reject invalid or malformed JWT token")
    void testValidateInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(tokenProvider.validateToken(""));
    }
}
