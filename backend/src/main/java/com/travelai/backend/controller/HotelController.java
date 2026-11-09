package com.travelai.backend.controller;

import com.travelai.backend.entity.Hotel;
import com.travelai.backend.repository.HotelRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelRepository hotelRepository;

    public HotelController(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllHotels() {
        return ResponseEntity.ok(
                hotelRepository.findAllByOrderByIdDesc()
        );
    }

    @PostMapping
    public ResponseEntity<?> createHotel(@RequestBody Hotel request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Vui lòng nhập tên khách sạn")
            );
        }

        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .location(request.getLocation())
                .province(request.getProvince())
                .rating(request.getRating() == null ? 5.0 : request.getRating())
                .rooms(request.getRooms() == null ? 1 : request.getRooms())
                .price(request.getPrice() == null ? 0.0 : request.getPrice())
                .status(request.getStatus() == null ? "active" : request.getStatus())
                .image(request.getImage())
                .build();

        return ResponseEntity.ok(hotelRepository.save(hotel));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateHotel(
            @PathVariable Long id,
            @RequestBody Hotel request
    ) {
        Hotel hotel = hotelRepository.findById(id).orElse(null);

        if (hotel == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Hotel not found")
            );
        }

        hotel.setName(request.getName());
        hotel.setLocation(request.getLocation());
        if (request.getProvince() != null) hotel.setProvince(request.getProvince());
        hotel.setRating(request.getRating());
        hotel.setRooms(request.getRooms());
        hotel.setPrice(request.getPrice());
        hotel.setStatus(request.getStatus());
        hotel.setImage(request.getImage());

        return ResponseEntity.ok(hotelRepository.save(hotel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHotel(@PathVariable Long id) {
        Hotel hotel = hotelRepository.findById(id).orElse(null);

        if (hotel == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Hotel not found")
            );
        }

        hotelRepository.delete(hotel);

        return ResponseEntity.ok(
                Map.of("message", "Delete hotel successfully")
        );
    }

    @GetMapping("/{id}")
public ResponseEntity<?> getHotelById(@PathVariable Long id) {
    Hotel hotel = hotelRepository.findById(id).orElse(null);

    if (hotel == null) {
        return ResponseEntity.badRequest().body(
                Map.of("message", "Hotel not found")
        );
    }

    return ResponseEntity.ok(hotel);
}
}
