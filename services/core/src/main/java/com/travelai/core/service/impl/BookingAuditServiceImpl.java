package com.travelai.core.service.impl;

import com.travelai.core.dto.request.BookingStatusUpdateRequest;
import com.travelai.core.dto.request.PaymentReconcileRequest;
import com.travelai.core.dto.response.BookingAuditStatsResponse;
import com.travelai.core.dto.response.BookingResponse;
import com.travelai.core.dto.response.PaymentResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Booking;
import com.travelai.core.model.entity.Payment;
import com.travelai.core.repository.BookingRepository;
import com.travelai.core.repository.PaymentRepository;
import com.travelai.core.service.BookingAuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Service
public class BookingAuditServiceImpl implements BookingAuditService {

    private static final Logger log = LoggerFactory.getLogger(BookingAuditServiceImpl.class);

    private static final Set<String> VALID_BOOKING_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "PAID", "COMPLETED", "CANCELLED"
    );

    private static final Set<String> VALID_RECONCILIATION_STATUSES = Set.of(
            "RECONCILED", "DISCREPANCY", "REFUNDED", "UNRECONCILED"
    );

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public BookingAuditServiceImpl(BookingRepository bookingRepository, PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsForAudit(String status, String bookingType, String keyword, Pageable pageable) {
        return bookingRepository.searchBookings(status, bookingType, keyword, pageable)
                .map(b -> {
                    Payment p = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(b.getId()).orElse(null);
                    return BookingResponse.fromEntity(b, p);
                });
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        String targetStatus = request.getStatus().trim().toUpperCase();
        if (!VALID_BOOKING_STATUSES.contains(targetStatus)) {
            throw new BadRequestException("Trạng thái đơn không hợp lệ: " + request.getStatus() +
                    ". Các trạng thái cho phép: " + VALID_BOOKING_STATUSES);
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus()) && !"CANCELLED".equalsIgnoreCase(targetStatus)) {
            throw new BadRequestException("Không thể khôi phục đơn đã bị hủy.");
        }

        if ("COMPLETED".equalsIgnoreCase(booking.getStatus()) && "CANCELLED".equalsIgnoreCase(targetStatus)) {
            throw new BadRequestException("Không thể hủy đơn đặt chỗ đã hoàn thành.");
        }

        booking.setStatus(targetStatus);
        Booking saved = bookingRepository.save(booking);

        log.info("Admin updated booking id={} status to '{}', note='{}'", bookingId, targetStatus, request.getNote());

        Payment payment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(bookingId).orElse(null);
        return BookingResponse.fromEntity(saved, payment);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingAuditStatsResponse getAuditStats() {
        long totalBookings = bookingRepository.count();
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();
        BigDecimal tourRevenue = bookingRepository.calculateTourRevenue();
        BigDecimal hotelRevenue = bookingRepository.calculateHotelRevenue();

        long pendingCount = bookingRepository.countByStatus("PENDING");
        long confirmedCount = bookingRepository.countByStatus("CONFIRMED");
        long paidCount = bookingRepository.countByStatus("PAID");
        long completedCount = bookingRepository.countByStatus("COMPLETED");
        long cancelledCount = bookingRepository.countByStatus("CANCELLED");

        long totalPayments = paymentRepository.count();
        long reconciledPayments = paymentRepository.countByReconciliationStatus("RECONCILED");

        double reconciliationRate = totalPayments > 0
                ? Math.round(((double) reconciledPayments / totalPayments) * 10000.0) / 100.0
                : 100.0;

        return new BookingAuditStatsResponse(
                totalBookings, totalRevenue, tourRevenue, hotelRevenue,
                pendingCount, confirmedCount, paidCount, completedCount, cancelledCount,
                totalPayments, reconciledPayments, reconciliationRate
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPaymentsForReconciliation(String status, String reconciliationStatus, String keyword, Pageable pageable) {
        return paymentRepository.searchPayments(status, reconciliationStatus, keyword, pageable)
                .map(PaymentResponse::fromEntity);
    }

    @Override
    @Transactional
    public PaymentResponse reconcilePayment(Long paymentId, PaymentReconcileRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        String targetStatus = request.getReconciliationStatus().trim().toUpperCase();
        if (!VALID_RECONCILIATION_STATUSES.contains(targetStatus)) {
            throw new BadRequestException("Trạng thái đối soát không hợp lệ: " + request.getReconciliationStatus() +
                    ". Các trạng thái cho phép: " + VALID_RECONCILIATION_STATUSES);
        }

        payment.setReconciliationStatus(targetStatus);
        payment.setReconciledAt(LocalDateTime.now());

        if (request.getTransactionRef() != null && !request.getTransactionRef().isBlank()) {
            payment.setTransactionRef(request.getTransactionRef().trim());
        }

        if (request.getAuditNotes() != null) {
            payment.setAuditNotes(request.getAuditNotes().trim());
        }

        Payment saved = paymentRepository.save(payment);
        log.info("Admin reconciled payment id={} status='{}' ref='{}'", paymentId, targetStatus, payment.getTransactionRef());

        return PaymentResponse.fromEntity(saved);
    }
}
