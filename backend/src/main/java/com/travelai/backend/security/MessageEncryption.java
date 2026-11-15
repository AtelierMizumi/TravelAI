package com.travelai.backend.security;

import com.travelai.backend.entity.ChatMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

@Service
public class MessageEncryption {
    private final MessageCryptography cryptography;

    public MessageEncryption(@Value("${travelai.message-key:}") String encodedKey,
                             @Value("${travelai.message-key-file:./.secrets/message.key}") String keyFile,
                             @Value("${travelai.message-key-required:false}") boolean required) {
        String value = encodedKey;
        if (value.isBlank() && Files.isRegularFile(Path.of(keyFile))) {
            try {
                value = Files.readString(Path.of(keyFile)).trim();
            } catch (IOException error) {
                throw new IllegalStateException("Cannot read message encryption key", error);
            }
        }
        if (required && value.isBlank()) {
            throw new IllegalStateException("Message encryption key is required but missing or empty");
        }
        try {
            cryptography = value.isBlank() ? null : new MessageCryptography(Base64.getDecoder().decode(value));
        } catch (IllegalArgumentException error) {
            throw new IllegalStateException("Invalid message encryption key configuration", error);
        }
    }

    public String encrypt(String content, Long sender, Long receiver) {
        if (cryptography == null) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Chưa cấu hình khóa mã hóa tin nhắn trên server.");
        return cryptography.encrypt(content, sender, receiver);
    }

    public String read(ChatMessage message) {
        if (message.getContentEncryption() == null) return message.getContent();
        if (!MessageCryptography.VERSION.equals(message.getContentEncryption()) || cryptography == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Không thể giải mã tin nhắn trên server.");
        }
        try {
            return cryptography.decrypt(message.getContent(), message.getSenderId(), message.getReceiverId());
        } catch (IllegalStateException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Không thể giải mã tin nhắn trên server.", error);
        }
    }
}
