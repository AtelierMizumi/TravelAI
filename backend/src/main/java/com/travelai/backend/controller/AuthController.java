package com.travelai.backend.controller;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final com.travelai.backend.security.SessionService sessions;
    private final com.travelai.backend.security.PasswordResetService passwordReset;

    public AuthController(UserRepository userRepository, com.travelai.backend.security.SessionService sessions, com.travelai.backend.security.PasswordResetService passwordReset) {
        this.userRepository = userRepository;
        this.sessions = sessions;
        this.passwordReset = passwordReset;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        long id = com.travelai.backend.security.ApiSecurity.currentActor().id();
        return ResponseEntity.ok(com.travelai.backend.security.SessionService.view(userRepository.findById(id).orElseThrow()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User request) {
        return ResponseEntity.ok(sessions.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {
        return ResponseEntity.ok(sessions.login(request.getEmail(), request.getPassword()));
    }

    public record ResetRequest(String email) {}
    public record ResetCode(String email,String code) {}
    public record ResetConfirmation(String email,String ticket,String newPassword,String confirmPassword) {}
    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody ResetRequest input, jakarta.servlet.http.HttpServletRequest request) {
        passwordReset.request(input.email(),request.getRemoteAddr());
        return ResponseEntity.ok(Map.of("message","Nếu email đã đăng ký, mã xác nhận sẽ được gửi đến email đó."));
    }
    @PostMapping("/password-reset/verify")
    public ResponseEntity<?> verifyPasswordReset(@RequestBody ResetCode input, jakarta.servlet.http.HttpServletRequest request) {
        String ticket=passwordReset.verifyCode(input.email(),input.code(),request.getRemoteAddr());
        if(ticket==null) return ResponseEntity.badRequest().body(Map.of("message","Mã không hợp lệ, đã hết hạn hoặc đã được sử dụng."));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(Map.of("ticket",ticket));
    }
    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody ResetConfirmation input, jakarta.servlet.http.HttpServletRequest request) {
        if(input.newPassword()==null || input.newPassword().length()<8 || input.newPassword().length()>1024 || !Objects.equals(input.newPassword(),input.confirmPassword()))
            return ResponseEntity.badRequest().body(Map.of("message","Mật khẩu phải có ít nhất 8 ký tự và hai lần nhập phải khớp."));
        if(!passwordReset.changePassword(input.email(),input.ticket(),input.newPassword(),request.getRemoteAddr()))
            return ResponseEntity.badRequest().body(Map.of("message","Phiên xác nhận đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu mã mới."));
        return ResponseEntity.ok(Map.of("message","Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value="Authorization", required=false) String authorization) {
        sessions.logout(authorization);
        return ResponseEntity.ok(Map.of("message", "Signed out"));
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody User request
    ) {

        User user =
                userRepository.findById(id)
                        .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "User not found"
                    )
            );
        }

        String avatar = request.getAvatar();
        if (avatar != null && !avatar.isBlank() && !Objects.equals(avatar, user.getAvatar())) {
            if (!avatar.startsWith("data:image/jpeg;base64,") || avatar.length() > 200_000) return ResponseEntity.badRequest().body(Map.of("message", "Ảnh đại diện JPEG vượt giới hạn hoặc không hợp lệ."));
            try {
                byte[] bytes=java.util.Base64.getDecoder().decode(avatar.substring("data:image/jpeg;base64,".length()));
                if(bytes.length<3 || (bytes[0]&255)!=255 || (bytes[1]&255)!=216 || (bytes[2]&255)!=255) return ResponseEntity.badRequest().body(Map.of("message", "Ảnh đại diện JPEG không hợp lệ."));
            } catch (IllegalArgumentException invalid) { return ResponseEntity.badRequest().body(Map.of("message", "Ảnh đại diện JPEG không hợp lệ.")); }
        }
        user.setName(request.getName());
        user.setBio(request.getBio());
        user.setAvatar(request.getAvatar());

        User savedUser =
                userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Update profile successfully",

                        "user",
                        Map.of(
                                "id", savedUser.getId(),
                                "name", savedUser.getName(),
                                "email", savedUser.getEmail(),
                                "role", savedUser.getRole(),
                                "status", savedUser.getStatus(),
                                "bio",
                                savedUser.getBio() == null
                                        ? ""
                                        : savedUser.getBio(),

                                "avatar",
                                savedUser.getAvatar() == null
                                        ? ""
                                        : savedUser.getAvatar()
                        )
                )
        );
    }

    @PutMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {

        sessions.changePassword(id, request.get("oldPassword"), request.get("newPassword"), request.get("confirmPassword"));
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
