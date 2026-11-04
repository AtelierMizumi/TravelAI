package com.travelai.core.controller;

import com.travelai.core.dto.request.BookingCreateRequest;
import com.travelai.core.dto.request.PaymentProcessRequest;
import com.travelai.core.dto.response.BookingResponse;
import com.travelai.core.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication) {
        BookingResponse response = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        Page<BookingResponse> bookings = bookingService.getUserBookings(authentication.getName(), pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        BookingResponse response = bookingService.getBookingById(authentication.getName(), id, isAdmin);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<BookingResponse> getBookingByCode(
            @PathVariable String bookingCode,
            Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        BookingResponse response = bookingService.getBookingByCode(authentication.getName(), bookingCode, isAdmin);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<BookingResponse> processPayment(
            @PathVariable Long id,
            @RequestBody(required = false) PaymentProcessRequest request,
            Authentication authentication) {
        BookingResponse response = bookingService.processPayment(authentication.getName(), id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {
        boolean isAdmin = isAdmin(authentication);
        BookingResponse response = bookingService.cancelBooking(authentication.getName(), id, isAdmin);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bookingType,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<BookingResponse> bookings = bookingService.searchAllBookings(status, bookingType, keyword, pageable);
        return ResponseEntity.ok(bookings);
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
    }
}
