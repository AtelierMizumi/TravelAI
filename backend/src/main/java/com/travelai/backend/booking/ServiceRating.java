package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="service_ratings", uniqueConstraints=@UniqueConstraint(columnNames="reservation_id"))
class ServiceRating {
    @Id String id;
    @Column(nullable=false, unique=true) String reservationId;
    long authorId;
    @Column(nullable=false) String authorName;
    @Column(nullable=false) String kind;
    long catalogId;
    int stars;
    @Column(nullable=false, columnDefinition="text") String comment;
    @Column(columnDefinition="text") String image;
    @Column(nullable=false) Instant createdAt;
}
