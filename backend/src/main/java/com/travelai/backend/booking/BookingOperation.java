package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_operations")
class BookingOperation {
    @Id String id;
    long ownerId;
    @Column(nullable=false) String action;
    @Column(nullable=false) String requestDigest;
    @Column(nullable=false, columnDefinition="text") String result;
}
