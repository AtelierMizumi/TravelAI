package com.travelai.backend.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Base64;
import java.util.Set;

/** Validates bounded audio envelopes before storing or passing them to a provider. */
public final class VoiceFormat {
    public static final String PREFIX = "VOICE_V1|";
    public record Audio(String mime, String base64) {}
    private VoiceFormat() {}
    public static Audio parse(String content) {
        if (content == null || !content.startsWith(PREFIX) || content.length() > 810_000) throw bad();
        String[] parts=content.split("\\|",3);
        if (parts.length!=3 || !Set.of("audio/m4a","audio/webm").contains(parts[1])) throw bad();
        try {
            byte[] bytes=Base64.getDecoder().decode(parts[2]);
            if (bytes.length<12 || bytes.length>600_000) throw bad();
            boolean webm=bytes[0]==0x1a && (bytes[1]&255)==0x45 && (bytes[2]&255)==0xdf && (bytes[3]&255)==0xa3;
            boolean m4a=bytes[4]=='f' && bytes[5]=='t' && bytes[6]=='y' && bytes[7]=='p';
            if ((parts[1].equals("audio/webm") && !webm) || (parts[1].equals("audio/m4a") && !m4a)) throw bad();
        } catch (IllegalArgumentException e) { throw bad(); }
        return new Audio(parts[1],parts[2]);
    }
    private static ResponseStatusException bad() { return new ResponseStatusException(HttpStatus.BAD_REQUEST,"Bản ghi âm không hợp lệ hoặc vượt giới hạn 600 KB."); }
}
