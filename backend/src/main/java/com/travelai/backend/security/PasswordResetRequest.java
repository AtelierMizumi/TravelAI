package com.travelai.backend.security;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="password_reset_requests")
class PasswordResetRequest {
    @Id Long userId;
    @Column(nullable=false, length=64) String codeDigest;
    @Column(nullable=false) Instant createdAt;
    @Column(nullable=false) Instant expiresAt;
    @Column(nullable=false) int failedAttempts;
    @Column(nullable=false) boolean consumed;
    @Column(length=64) String ticketDigest;
    Instant ticketExpiresAt;
}
