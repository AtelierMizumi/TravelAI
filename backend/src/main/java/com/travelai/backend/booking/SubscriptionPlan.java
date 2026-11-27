package com.travelai.backend.booking;

import jakarta.persistence.*;

@Entity
@Table(name = "subscription_plans")
class SubscriptionPlan {
    @Id
    @Column(length = 40)
    String code;

    @Column(nullable = false, length = 120)
    String name;

    @Column(nullable = false)
    long priceVnd;

    @Column(nullable = false)
    int durationDays;

    @Column(nullable = false)
    int discountPercent;

    @Column(nullable = false)
    boolean waiveFirstRescheduleFee;

    @Column(nullable = false)
    boolean unlimitedAi;

    @Column(nullable = false, length = 60)
    String badge;

    @Column(nullable = false, columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    boolean active;
}
