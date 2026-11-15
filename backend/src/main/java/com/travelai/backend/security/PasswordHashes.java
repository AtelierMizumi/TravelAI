package com.travelai.backend.security;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.*;
import java.util.*;

public final class PasswordHashes {
    private static final int ITERATIONS = 210_000;
    private PasswordHashes() {}

    public static String encode(String password) {
        if (password == null || password.length() < 8 || password.length() > 1024)
            throw new IllegalArgumentException("Password must contain 8 to 1024 characters");
        return hash(password);
    }
    static String upgradeLegacy(String password) {
        if (password == null || password.isEmpty() || password.length() > 1024)
            throw new IllegalArgumentException("Invalid legacy credential");
        return hash(password);
    }
    private static String hash(String password) {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return "pbkdf2$" + ITERATIONS + "$" + Base64.getEncoder().encodeToString(salt)
                + "$" + Base64.getEncoder().encodeToString(derive(password, salt, ITERATIONS));
    }
    public static boolean matches(String password, String encoded) {
        if (password == null || password.length() > 1024 || encoded == null) return false;
        try {
            String[] parts = encoded.split("\\$");
            if (parts.length != 4 || !parts[0].equals("pbkdf2")) return false;
            int count = Integer.parseInt(parts[1]);
            if (count < ITERATIONS || count > 1_000_000) return false;
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            if (salt.length != 16) return false;
            return MessageDigest.isEqual(derive(password, salt, count), Base64.getDecoder().decode(parts[3]));
        } catch (IllegalArgumentException e) { return false; }
    }
    private static byte[] derive(String password, byte[] salt, int iterations) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, 256);
        try { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(); }
        catch (GeneralSecurityException e) { throw new IllegalStateException("Password hashing unavailable", e); }
        finally { spec.clearPassword(); }
    }
    static String digest(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
