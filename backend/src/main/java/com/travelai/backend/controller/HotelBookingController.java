package com.travelai.backend.controller;

import com.travelai.backend.entity.HotelBooking;
import com.travelai.backend.entity.Notification;
import com.travelai.backend.service.NotificationPublisher;
import com.travelai.backend.repository.HotelBookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/hotel-bookings")
public class HotelBookingController {

    private final HotelBookingRepository repository;
    private final NotificationPublisher notificationPublisher;

    public HotelBookingController(
            HotelBookingRepository repository,
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
    public ResponseEntity<?> create(@RequestBody HotelBooking request) {
        if (request.getCheckIn() == null || request.getCheckIn().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn ngày check-in"));
        }

        if (request.getCheckOut() == null || request.getCheckOut().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng chọn ngày check-out"));
        }

        LocalDate checkIn = LocalDate.parse(request.getCheckIn());
        LocalDate checkOut = LocalDate.parse(request.getCheckOut());

        if (checkIn.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không được chọn ngày check-in trong quá khứ"));
        }

        if (!checkOut.isAfter(checkIn)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Check-out phải sau check-in"));
        }

        int rooms = request.getRooms() == null || request.getRooms() < 1
                ? 1
                : request.getRooms();

        int guests = request.getGuests() == null || request.getGuests() < 1
                ? 1
                : request.getGuests();

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        double unitPrice = request.getUnitPrice() != null && request.getUnitPrice() > 0
                ? request.getUnitPrice()
                : request.getPrice() / rooms / nights;

        HotelBooking booking = HotelBooking.builder()
                .userId(request.getUserId())
                .userName(request.getUserName())
                .hotelName(request.getHotelName())
                .unitPrice(unitPrice)
                .price(unitPrice * rooms * nights)
                .rooms(rooms)
                .guests(guests)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        HotelBooking saved = repository.save(booking);

        notificationPublisher.save(
                Notification.builder()
                        .userId(0L)
                        .actorId(saved.getUserId())
                        .actorName(saved.getUserName())
                        .type("ADMIN_BOOKING")
                        .title("Booking khách sạn mới")
                        .message(saved.getUserName() + " vừa đặt khách sạn " + saved.getHotelName())
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
            @RequestBody HotelBooking request
    ) {
        HotelBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hotel booking not found"));
        }

        LocalDate checkIn = LocalDate.parse(request.getCheckIn());
        LocalDate checkOut = LocalDate.parse(request.getCheckOut());

        if (checkIn.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không được chọn ngày check-in trong quá khứ"));
        }

        if (!checkOut.isAfter(checkIn)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Check-out phải sau check-in"));
        }

        int rooms = request.getRooms() == null || request.getRooms() < 1
                ? booking.getRooms()
                : request.getRooms();

        int guests = request.getGuests() == null || request.getGuests() < 1
                ? booking.getGuests()
                : request.getGuests();

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        double unitPrice = booking.getUnitPrice() != null && booking.getUnitPrice() > 0
                ? booking.getUnitPrice()
                : booking.getPrice() / booking.getRooms();

        booking.setRooms(rooms);
        booking.setGuests(guests);
        booking.setCheckIn(request.getCheckIn());
        booking.setCheckOut(request.getCheckOut());
        booking.setPrice(unitPrice * rooms * nights);

        return ResponseEntity.ok(repository.save(booking));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        HotelBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hotel booking not found"));
        }

        booking.setStatus("APPROVED");
        HotelBooking saved = repository.save(booking);

        notificationPublisher.save(
                Notification.builder()
                        .userId(saved.getUserId())
                        .actorName("TravelAI Admin")
                        .type("BOOKING")
                        .title("Khách sạn đã được duyệt")
                        .message("Đặt phòng " + saved.getHotelName() + " của bạn đã được xác nhận.")
                        .targetId(saved.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        HotelBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hotel booking not found"));
        }

        booking.setStatus("REJECTED");
        HotelBooking saved = repository.save(booking);

        notificationPublisher.save(
                Notification.builder()
                        .userId(saved.getUserId())
                        .actorName("TravelAI Admin")
                        .type("BOOKING")
                        .title("Khách sạn bị từ chối")
                        .message("Đặt phòng " + saved.getHotelName() + " của bạn chưa được xác nhận.")
                        .targetId(saved.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        HotelBooking booking = repository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hotel booking not found"));
        }

        repository.delete(booking);

        return ResponseEntity.ok(Map.of("message", "Delete hotel booking successfully"));
    }
}