package com.travelai.core.service;

import com.travelai.core.dto.request.BookingStatusUpdateRequest;
import com.travelai.core.dto.request.PaymentReconcileRequest;
import com.travelai.core.dto.response.BookingAuditStatsResponse;
import com.travelai.core.dto.response.BookingResponse;
import com.travelai.core.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingAuditService {

    Page<BookingResponse> getBookingsForAudit(String status, String bookingType, String keyword, Pageable pageable);

    BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request);

    BookingAuditStatsResponse getAuditStats();

    Page<PaymentResponse> getPaymentsForReconciliation(String status, String reconciliationStatus, String keyword, Pageable pageable);

    PaymentResponse reconcilePayment(Long paymentId, PaymentReconcileRequest request);
}
