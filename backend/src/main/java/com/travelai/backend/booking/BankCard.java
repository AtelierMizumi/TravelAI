package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="simulated_cards")
class BankCard {
    @Id String id;
    @Column(nullable=false) String accountId;
    @Column(nullable=false, unique=true) String syntheticId;
    @com.fasterxml.jackson.annotation.JsonIgnore String cvvHash;
    @Column(nullable=false) String bankName;
    @Column(nullable=false) boolean linked;
    int expiryMonth;
    int expiryYear;
    @Column(nullable=false) String status;
}
