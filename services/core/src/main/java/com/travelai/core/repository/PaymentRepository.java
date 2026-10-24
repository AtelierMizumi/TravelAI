package com.travelai.core.repository;

import com.travelai.core.model.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionCode(String transactionCode);

    Optional<Payment> findFirstByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<Payment> findAllByBookingIdOrderByCreatedAtDesc(Long bookingId);
}
