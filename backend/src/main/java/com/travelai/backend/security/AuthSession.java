package com.travelai.backend.security;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "auth_sessions")
public class AuthSession {
    @Id String tokenDigest;
    @Column(nullable = false) Long userId;
    @Column(nullable = false) Instant issuedAt;
    @Column(nullable = false) Instant lastActivityAt;
    @Column(nullable = false) Instant expiresAt;
}
