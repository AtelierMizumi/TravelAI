package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_allocations")
class InventoryAllocation {
    @Id String id;
    String reservationId;
    String reviewId;
    @Column(nullable=false) String resourceKey;
    int quantity;
    Instant serviceStart;
    Instant expiresAt;
    @Column(nullable=false) String status;
}
