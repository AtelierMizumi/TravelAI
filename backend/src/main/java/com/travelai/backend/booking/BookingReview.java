package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_reviews")
class BookingReview {
    @Id String id;
    long ownerId;
    String reservationId;
    long reservationRevision;
    @Column(nullable=false) String status;
    String digest;
    Instant createdAt;
    Instant expiresAt;
    @Column(nullable=false, columnDefinition="text") String quote;
}
