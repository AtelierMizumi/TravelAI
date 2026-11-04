package com.travelai.core.repository;

import com.travelai.core.model.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionCode(String transactionCode);

    Optional<Payment> findFirstByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<Payment> findAllByBookingIdOrderByCreatedAtDesc(Long bookingId);

    @Query("SELECT p FROM Payment p WHERE " +
            "(:status IS NULL OR LOWER(p.status) = LOWER(:status)) AND " +
            "(:reconciliationStatus IS NULL OR LOWER(p.reconciliationStatus) = LOWER(:reconciliationStatus)) AND " +
            "(:keyword IS NULL OR LOWER(p.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            " LOWER(p.transactionRef) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Payment> searchPayments(
            @Param("status") String status,
            @Param("reconciliationStatus") String reconciliationStatus,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    long countByReconciliationStatus(String reconciliationStatus);
}

