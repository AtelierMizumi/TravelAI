package com.travelai.backend.security;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/** AES-256-GCM encryption for message content stored by the server. */
public final class MessageCryptography {
    public static final String VERSION = "AES256_GCM_V1";
    private static final int NONCE_BYTES = 12;
    private final SecretKeySpec key;
    private final SecureRandom random = new SecureRandom();

    public MessageCryptography(byte[] keyBytes) {
        if (keyBytes == null || keyBytes.length != 32) {
            throw new IllegalArgumentException("A 32-byte message encryption key is required");
        }
        this.key = new SecretKeySpec(keyBytes.clone(), "AES");
    }

    public String encrypt(String content, Long senderId, Long receiverId) {
        try {
            byte[] nonce = new byte[NONCE_BYTES];
            random.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, nonce));
            cipher.updateAAD(associatedData(senderId, receiverId));
            byte[] ciphertext = cipher.doFinal(content.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(ByteBuffer.allocate(nonce.length + ciphertext.length)
                    .put(nonce).put(ciphertext).array());
        } catch (GeneralSecurityException error) {
            throw new IllegalStateException("Message encryption failed", error);
        }
    }

    public String decrypt(String encoded, Long senderId, Long receiverId) {
        try {
            byte[] bytes = Base64.getDecoder().decode(encoded);
            if (bytes.length < NONCE_BYTES + 16) throw new GeneralSecurityException("Invalid encrypted message");
            ByteBuffer buffer = ByteBuffer.wrap(bytes);
            byte[] nonce = new byte[NONCE_BYTES];
            buffer.get(nonce);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, nonce));
            cipher.updateAAD(associatedData(senderId, receiverId));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException | GeneralSecurityException error) {
            throw new IllegalStateException("Message decryption failed", error);
        }
    }

    private byte[] associatedData(Long senderId, Long receiverId) {
        return ("travelai-chat:v1:" + senderId + ":" + receiverId).getBytes(StandardCharsets.UTF_8);
    }
}
