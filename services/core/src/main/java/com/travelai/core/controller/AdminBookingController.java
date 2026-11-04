package com.travelai.core.controller;

import com.travelai.core.dto.request.BookingStatusUpdateRequest;
import com.travelai.core.dto.request.PaymentReconcileRequest;
import com.travelai.core.dto.response.BookingAuditStatsResponse;
import com.travelai.core.dto.response.BookingResponse;
import com.travelai.core.dto.response.PaymentResponse;
import com.travelai.core.service.BookingAuditService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingAuditService bookingAuditService;

    public AdminBookingController(BookingAuditService bookingAuditService) {
        this.bookingAuditService = bookingAuditService;
    }

    @GetMapping
    public ResponseEntity<Page<BookingResponse>> getBookingsForAudit(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bookingType,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<BookingResponse> bookings = bookingAuditService.getBookingsForAudit(status, bookingType, keyword, pageable);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        BookingResponse response = bookingAuditService.updateBookingStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<BookingAuditStatsResponse> getAuditStats() {
        BookingAuditStatsResponse stats = bookingAuditService.getAuditStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reconciliation")
    public ResponseEntity<Page<PaymentResponse>> getPaymentsForReconciliation(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String reconciliationStatus,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<PaymentResponse> payments = bookingAuditService.getPaymentsForReconciliation(status, reconciliationStatus, keyword, pageable);
        return ResponseEntity.ok(payments);
    }

    @PutMapping("/reconciliation/{paymentId}")
    public ResponseEntity<PaymentResponse> reconcilePayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody PaymentReconcileRequest request) {
        PaymentResponse response = bookingAuditService.reconcilePayment(paymentId, request);
        return ResponseEntity.ok(response);
    }
}
