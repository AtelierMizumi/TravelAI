package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="simulated_transactions")
class BankTransaction {
    @Id String id;
    String accountId;
    String reservationId;
    String operationId;
    @Column(nullable=false) String kind;
    long amount;
    Instant createdAt;
}
