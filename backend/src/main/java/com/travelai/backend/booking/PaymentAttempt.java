package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="simulated_payment_attempts")
class PaymentAttempt {
    @Id String id;
    @Column(nullable=false, unique=true) String operationId;
    long ownerId;
    @Column(nullable=false) String reviewId;
    String reservationId;
    @Column(nullable=false) String status;
    @Column(nullable=false) String reason;
    long amount;
    @Column(nullable=false) Instant createdAt;
}
