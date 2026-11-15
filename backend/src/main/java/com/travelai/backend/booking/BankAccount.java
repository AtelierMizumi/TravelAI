package com.travelai.backend.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="simulated_accounts")
class BankAccount {
    @Id String id;
    @Column(nullable=false, unique=true) long ownerId;
    @Column(nullable=false) long balance;
}
