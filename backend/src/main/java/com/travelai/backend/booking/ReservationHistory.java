package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_history")
class ReservationHistory {
    @Id String id;
    String reservationId;
    String operationId;
    long actorId;
    @Column(nullable=false) String action;
    Instant createdAt;
    @Column(nullable=false, columnDefinition="text") String details;
}
