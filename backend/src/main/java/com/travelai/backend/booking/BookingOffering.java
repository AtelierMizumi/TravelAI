package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_offerings")
class BookingOffering {
    @Id String id;
    Long legacyId;
    @Column(nullable=false) String kind;
    @Column(nullable=false) String version;
    @Column(nullable=false) boolean active;
    @Column(nullable=false, columnDefinition="text") String definition;
}
