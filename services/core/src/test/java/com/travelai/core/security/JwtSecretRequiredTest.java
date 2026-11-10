package com.travelai.core.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * A1/A2: the backend must refuse to start with a missing, blank, weak or
 * documented placeholder JWT secret, and say which variable to fix.
 */
class JwtSecretRequiredTest {

    private static final long EXPIRATION_MS = 3600000;

    @ParameterizedTest
    @ValueSource(strings = {
            "",
            "                                                                ",
            "too-short",
            "replace-with-output-of-openssl-rand-hex-32"
    })
    @DisplayName("Rejects blank, weak, and documented placeholder secrets")
    void rejectsUnsafeSecrets(String secret) {
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> new JwtTokenProvider(secret, EXPIRATION_MS));
        assertTrue(ex.getMessage().contains("JWT_SECRET"),
                "message should name JWT_SECRET, was: " + ex.getMessage());
    }

    @Test
    @DisplayName("Rejects the public tutorial key that used to be the default")
    void rejectsRevokedPublicKey() {
        // Known-public key, revoked: present only to prove it can never be used again.
        String revoked = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> new JwtTokenProvider(revoked, EXPIRATION_MS));
        assertTrue(ex.getMessage().contains("JWT_SECRET"));
    }

    @Test
    @DisplayName("Rejects a null secret")
    void rejectsNullSecret() {
        assertThrows(IllegalStateException.class, () -> new JwtTokenProvider(null, EXPIRATION_MS));
    }

    @Test
    @DisplayName("Accepts a random 256-bit hex secret")
    void acceptsRandomSecret() {
        // TEST ONLY synthetic secret - never use in production
        assertDoesNotThrow(() -> new JwtTokenProvider(
                "79bd464d2e683674a9b549dec0cfeca659a1b19969d432365ed81df28990020a", EXPIRATION_MS));
    }
}
