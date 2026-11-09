package com.travelai.backend.controller;

import com.travelai.backend.entity.User;
import com.travelai.backend.security.SessionService;
import org.springframework.transaction.annotation.Transactional;
import com.travelai.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final SessionService sessions;

    public UserController(UserRepository userRepository, SessionService sessions) {
        this.sessions = sessions;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @Transactional
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "User not found")
            );
        }

        String status =
                user.getStatus() == null
                        ? "active"
                        : user.getStatus();

        user.setStatus(
                status.equals("active")
                        ? "blocked"
                        : "active"
        );

        if ("blocked".equals(user.getStatus())) sessions.revokeUser(id);
        return ResponseEntity.ok(
                userRepository.save(user)
        );
    }

    @PutMapping("/{id}/make-admin")
    public ResponseEntity<?> makeAdmin(
            @PathVariable Long id
    ) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "User not found")
            );
        }

        user.setRole("ADMIN");

        return ResponseEntity.ok(
                userRepository.save(user)
        );
    }

    @PutMapping("/{id}/remove-admin")
    public ResponseEntity<?> removeAdmin(
            @PathVariable Long id
    ) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "User not found")
            );
        }

        user.setRole("USER");

        return ResponseEntity.ok(
                userRepository.save(user)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id
    ) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "User not found")
            );
        }

        userRepository.delete(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Delete user successfully"
                )
        );
    }

    @PostMapping
public ResponseEntity<?> createUser(@RequestBody User request) {
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        return ResponseEntity.badRequest().body(
                Map.of("message", "Email already exists")
        );
    }

    User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(com.travelai.backend.security.PasswordHashes.encode(request.getPassword()))
            .role(request.getRole() == null ? "USER" : request.getRole())
            .status(request.getStatus() == null ? "active" : request.getStatus())
            .bio(request.getBio())
            .avatar(request.getAvatar())
            .build();

    return ResponseEntity.ok(userRepository.save(user));
}

@Transactional
@PutMapping("/{id}")
public ResponseEntity<?> updateUser(
        @PathVariable Long id,
        @RequestBody User request
) {
    User user = userRepository.findById(id).orElse(null);

    if (user == null) {
        return ResponseEntity.badRequest().body(
                Map.of("message", "User not found")
        );
    }

    boolean revoke = !java.util.Objects.equals(user.getRole(), request.getRole())
            || "blocked".equalsIgnoreCase(request.getStatus());
    user.setName(request.getName());
    user.setRole(request.getRole());
    user.setStatus(request.getStatus());
    user.setBio(request.getBio());
    user.setAvatar(request.getAvatar());

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
        user.setPassword(com.travelai.backend.security.PasswordHashes.encode(request.getPassword()));
        revoke = true;
    }

    User saved = userRepository.save(user);
    if (revoke) sessions.revokeUser(id);
    return ResponseEntity.ok(saved);
}
}