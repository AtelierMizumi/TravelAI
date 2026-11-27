package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_subscriptions")
class UserSubscription {
    @Id
    @Column(length = 64)
    String id;

    @Column(nullable = false)
    long userId;

    @Column(nullable = false, length = 40)
    String planCode;

    @Column(nullable = false, length = 120)
    String planName;

    @Column(nullable = false)
    int discountPercent;

    @Column(nullable = false)
    boolean waiveFirstRescheduleFee;

    @Column(nullable = false)
    boolean unlimitedAi;

    @Column(nullable = false, length = 60)
    String badge;

    @Column(nullable = false, length = 32)
    String status;

    @Column(nullable = false)
    long paidAmount;

    @Column(length = 64)
    String sourceAccountId;

    @Column(nullable = false)
    Instant startsAt;

    @Column(nullable = false)
    Instant expiresAt;

    @Column(nullable = false)
    Instant createdAt;
}
