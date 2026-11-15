package com.travelai.backend.security;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordHashesTest {
    @Test void hashesAreSaltedAndVerifyOnlyTheOriginalPassword() {
        String a = PasswordHashes.encode("Synthetic-password-123");
        String b = PasswordHashes.encode("Synthetic-password-123");
        assertNotEquals(a, b);
        assertTrue(PasswordHashes.matches("Synthetic-password-123", a));
        assertFalse(PasswordHashes.matches("wrong", a));
        assertFalse(PasswordHashes.matches("Synthetic-password-123", "broken-hash"));
    }
    @Test void missingOrMalformedPasswordsNeverAuthenticate() {
        assertFalse(PasswordHashes.matches(null, "invalid"));
        assertFalse(PasswordHashes.matches("test", null));
        assertFalse(PasswordHashes.matches("test", "pbkdf2$999999999$bad$bad"));
    }
}
