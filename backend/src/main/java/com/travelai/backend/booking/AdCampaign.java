package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ad_campaigns")
class AdCampaign {
    @Id
    @Column(length = 64)
    String id;

    @Column(nullable = false)
    long ownerId;

    @Column(nullable = false, length = 40)
    String packageCode;

    @Column(nullable = false, length = 120)
    String packageName;

    @Column(nullable = false, length = 40)
    String placement;

    @Column(nullable = false, length = 16)
    String targetKind;

    @Column(nullable = false)
    long targetId;

    @Column(nullable = false, length = 160)
    String headline;

    @Column(nullable = false)
    int durationDays;

    @Column(nullable = false, length = 32)
    String status;

    @Column(nullable = false)
    long paidAmount;

    @Column(length = 64)
    String sourceAccountId;

    @Column(nullable = false)
    long impressions;

    @Column(nullable = false)
    long clicks;

    @Column(length = 500)
    String adminNote;

    Instant startsAt;

    Instant endsAt;

    @Column(nullable = false)
    Instant createdAt;
}
