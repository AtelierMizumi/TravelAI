package com.travelai.backend.controller;

import com.travelai.backend.entity.Notification;
import com.travelai.backend.service.NotificationPublisher;
import com.travelai.backend.entity.TourBooking;
import com.travelai.backend.repository.TourBookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/tour-bookings")
public class TourBookingController {

    private final TourBookingRepository repository;
    private final NotificationPublisher notificationPublisher;

    public TourBookingController(
            TourBookingRepository repository,
            NotificationPublisher notificationPublisher
    ) {
        this.repository = repository;
        this.notificationPublisher = notificationPublisher;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(repository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TourBooking request) {
        if (request.getBookingDate() == null || request.getBookingDate().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn ngày đi"));
        }

        LocalDate bookingDate = LocalDate.parse(request.getBookingDate());

        if (bookingDate.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không được đặt tour ở ngày quá khứ"));
        }

        int guests = request.getGuests() == null || request.getGuests() < 1
                ? 1
                : request.getGuests();

        double unitPrice = request.getUnitPrice() != null && request.getUnitPrice() > 0
                ? request.getUnitPrice()
                : request.getPrice() / guests;

        TourBooking booking = TourBooking.builder()
                .userId(request.getUserId())
                .userName(request.getUserName())
                .tourName(request.getTourName())
                .unitPrice(unitPrice)
                .price(unitPrice * guests)
                .guests(guests)
                .bookingDate(request.getBookingDate())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        TourBooking saved = repository.save(booking);

        notificationPublisher.save(
                Notification.builder()
                        .userId(0L)
                        .actorId(saved.getUserId())
                        .actorName(saved.getUserName())
                        .type("ADMIN_BOOKING")
                        .title("Booking tour mới")
                        .message(saved.getUserName() + " vừa đặt tour " + saved.getTourName())
                        .targetId(saved.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody TourBooking request
    ) {
        TourBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tour booking not found"));
        }

        if (request.getBookingDate() == null || request.getBookingDate().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn ngày đi"));
        }

        LocalDate bookingDate = LocalDate.parse(request.getBookingDate());

        if (bookingDate.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không được chọn ngày quá khứ"));
        }

        int guests = request.getGuests() == null || request.getGuests() < 1
                ? booking.getGuests()
                : request.getGuests();

        double unitPrice = booking.getUnitPrice() != null && booking.getUnitPrice() > 0
                ? booking.getUnitPrice()
                : booking.getPrice() / booking.getGuests();

        booking.setGuests(guests);
        booking.setBookingDate(request.getBookingDate());
        booking.setPrice(unitPrice * guests);

        return ResponseEntity.ok(repository.save(booking));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        TourBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tour booking not found"));
        }

        booking.setStatus("APPROVED");
        TourBooking saved = repository.save(booking);

        notificationPublisher.save(
                Notification.builder()
                        .userId(saved.getUserId())
                        .actorName("TravelAI Admin")
                        .type("BOOKING")
                        .title("Tour đã được duyệt")
                        .message("Tour " + saved.getTourName() + " của bạn đã được xác nhận.")
                        .targetId(saved.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        TourBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tour booking not found"));
        }

        booking.setStatus("REJECTED");
        TourBooking saved = repository.save(booking);

        notificationPublisher.save(
                Notification.builder()
                        .userId(saved.getUserId())
                        .actorName("TravelAI Admin")
                        .type("BOOKING")
                        .title("Tour bị từ chối")
                        .message("Tour " + saved.getTourName() + " của bạn chưa được xác nhận.")
                        .targetId(saved.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        TourBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tour booking not found"));
        }

        repository.delete(booking);

        return ResponseEntity.ok(Map.of("message", "Delete tour booking successfully"));
    }
}