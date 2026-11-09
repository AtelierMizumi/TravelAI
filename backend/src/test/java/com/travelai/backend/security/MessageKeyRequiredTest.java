package com.travelai.backend.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class MessageKeyRequiredTest {
    static final String KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    @Test void requiredWithMissingFileFailsFast(@TempDir Path dir) {
        assertThrows(IllegalStateException.class,
                () -> new MessageEncryption("", dir.resolve("absent.key").toString(), true));
    }

    @Test void requiredWithEmptyFileFailsFast(@TempDir Path dir) throws Exception {
        Path file = Files.writeString(dir.resolve("empty.key"), "\n");
        assertThrows(IllegalStateException.class,
                () -> new MessageEncryption("", file.toString(), true));
    }

    @Test void requiredWithValidFileStarts(@TempDir Path dir) throws Exception {
        Path file = Files.writeString(dir.resolve("ok.key"), KEY + "\n");
        assertDoesNotThrow(() -> new MessageEncryption("", file.toString(), true));
    }

    @Test void notRequiredKeepsDevBehaviourOfStartingWithoutKey(@TempDir Path dir) {
        assertDoesNotThrow(() -> new MessageEncryption("", dir.resolve("absent.key").toString(), false));
    }
}
