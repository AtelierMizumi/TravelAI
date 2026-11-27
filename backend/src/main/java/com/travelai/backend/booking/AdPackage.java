package com.travelai.backend.booking;

import jakarta.persistence.*;

@Entity
@Table(name = "ad_packages")
class AdPackage {
    @Id
    @Column(length = 40)
    String code;

    @Column(nullable = false, length = 120)
    String name;

    @Column(nullable = false)
    long priceVnd;

    @Column(nullable = false)
    int durationDays;

    @Column(nullable = false, length = 40)
    String placement;

    @Column(nullable = false, columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    boolean active;
}
