package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_reservations")
class Reservation {
    @Id String id;
    long ownerId;
    String offeringId;
    String sourceAccountId;
    @Column(nullable=false) String status;
    long originalAmount;
    long totalPaid;
    long revision;
    Instant createdAt;
    @Column(nullable=false, columnDefinition="text") String itinerary;
}
