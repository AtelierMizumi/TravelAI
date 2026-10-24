package com.travelai.core.service;

import com.travelai.core.dto.request.BookingCreateRequest;
import com.travelai.core.dto.request.PaymentProcessRequest;
import com.travelai.core.dto.response.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookingService {

    BookingResponse createBooking(String username, BookingCreateRequest request);

    BookingResponse getBookingById(String username, Long bookingId, boolean isAdmin);

    BookingResponse getBookingByCode(String username, String bookingCode, boolean isAdmin);

    Page<BookingResponse> getUserBookings(String username, Pageable pageable);

    Page<BookingResponse> searchAllBookings(String status, String bookingType, String keyword, Pageable pageable);

    BookingResponse cancelBooking(String username, Long bookingId, boolean isAdmin);

    BookingResponse processPayment(String username, Long bookingId, PaymentProcessRequest request);
}
