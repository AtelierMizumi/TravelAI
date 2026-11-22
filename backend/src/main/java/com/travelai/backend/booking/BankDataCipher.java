package com.travelai.backend.booking;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;

/** Encrypt identifiers and verify synthetic three-digit codes without storing recoverable codes. */
@Service
public class BankDataCipher {
    private final byte[] encryptionKey;
    private final byte[] verifierKey;
    private final SecureRandom random = new SecureRandom();
    public BankDataCipher(@Value("${travelai.bank-key:${travelai.message-key:}}") String encoded,
                          @Value("${travelai.bank-key-file:${travelai.message-key-file:./.secrets/message.key}}") String file) {
        try {
            String value = encoded.isBlank() && Files.isRegularFile(Path.of(file)) ? Files.readString(Path.of(file)).trim() : encoded;
            byte[] root = Base64.getDecoder().decode(value);
            if (root.length != 32) throw new IllegalArgumentException("A 32-byte bank encryption key is required");
            encryptionKey = hmac(root, "travelai:bank:encryption:v1");
            verifierKey = hmac(root, "travelai:bank:verification:v1");
            Arrays.fill(root, (byte)0);
        } catch (Exception error) { throw new IllegalStateException("Configure the original bank/message encryption key before starting", error); }
    }
    private static byte[] hmac(byte[] key, String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(key,"HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (Exception error) { throw new IllegalStateException("Bank verification unavailable",error); }
    }
    String lookup(String identifier) { return HexFormat.of().formatHex(hmac(verifierKey,"identifier:"+identifier)); }
    String verifier(String id,String code) { return "HMAC256:"+HexFormat.of().formatHex(hmac(verifierKey,"code:"+id+":"+code)); }
    boolean matches(String id,String code,String encoded) {
        return code!=null && encoded!=null && MessageDigest.isEqual(verifier(id,code).getBytes(StandardCharsets.UTF_8),encoded.getBytes(StandardCharsets.UTF_8));
    }
    String encrypt(String id,String value) {
        try {
            byte[] nonce = new byte[12]; random.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(encryptionKey,"AES"),new GCMParameterSpec(128,nonce));
            cipher.updateAAD(("travelai:bank:identifier:v1:"+id).getBytes(StandardCharsets.UTF_8));
            byte[] encrypted=cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
            byte[] result=new byte[nonce.length+encrypted.length];System.arraycopy(nonce,0,result,0,nonce.length);System.arraycopy(encrypted,0,result,nonce.length,encrypted.length);
            return Base64.getEncoder().encodeToString(result);
        } catch(Exception error) { throw new IllegalStateException("Cannot encrypt bank identifier",error); }
    }
    String decrypt(String id,String encoded) {
        try {
            byte[] raw=Base64.getDecoder().decode(encoded);
            if(raw.length<28) throw new IllegalArgumentException("Invalid bank ciphertext");
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,new SecretKeySpec(encryptionKey,"AES"),new GCMParameterSpec(128,Arrays.copyOf(raw,12)));
            cipher.updateAAD(("travelai:bank:identifier:v1:"+id).getBytes(StandardCharsets.UTF_8));
            return new String(cipher.doFinal(Arrays.copyOfRange(raw,12,raw.length)),StandardCharsets.UTF_8);
        } catch(Exception error) { throw new IllegalStateException("Cannot decrypt bank identifier using the configured key",error); }
    }
}
