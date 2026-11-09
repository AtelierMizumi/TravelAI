package com.travelai.backend.security;

import org.junit.jupiter.api.Test;
import java.util.Base64;
import static org.junit.jupiter.api.Assertions.*;

class MessageCryptographyTest {
    private final MessageCryptography cipher = new MessageCryptography(new byte[32]);

    @Test void encryptsWithRandomNoncesAndDecryptsVietnameseText() {
        String first = cipher.encrypt("Tin nhắn thử nghiệm", 1L, 2L);
        String second = cipher.encrypt("Tin nhắn thử nghiệm", 1L, 2L);
        assertNotEquals(first, second);
        assertNotEquals("Tin nhắn thử nghiệm", first);
        assertEquals("Tin nhắn thử nghiệm", cipher.decrypt(first, 1L, 2L));
    }
    @Test void rejectsTamperingAndChangingParticipants() {
        String encrypted = cipher.encrypt("Synthetic", 1L, 2L);
        byte[] modified = Base64.getDecoder().decode(encrypted);
        modified[modified.length - 1] ^= 1;
        assertThrows(IllegalStateException.class, () -> cipher.decrypt(Base64.getEncoder().encodeToString(modified), 1L, 2L));
        assertThrows(IllegalStateException.class, () -> cipher.decrypt(encrypted, 1L, 3L));
    }
    @Test void validatesKeyLength() {
        assertThrows(IllegalArgumentException.class, () -> new MessageCryptography(new byte[16]));
    }
}
