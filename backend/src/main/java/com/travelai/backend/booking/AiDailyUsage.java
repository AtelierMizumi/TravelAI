package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "ai_daily_usage")
class AiDailyUsage {
    @Id
    @Column(length = 80)
    String id;

    @Column(nullable = false)
    long userId;

    @Column(nullable = false)
    LocalDate usageDate;

    @Column(nullable = false)
    int usedCount;
}
