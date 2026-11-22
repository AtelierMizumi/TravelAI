package com.travelai.backend.controller;

import com.travelai.backend.entity.Hotel;
import com.travelai.backend.catalog.CatalogDeleteGuard;
import com.travelai.backend.repository.HotelRepository;
import jakarta.persistence.EntityManager;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelRepository hotelRepository;
    private final CatalogDeleteGuard deleteGuard;
    private final EntityManager entityManager;

    public HotelController(HotelRepository hotelRepository, CatalogDeleteGuard deleteGuard, EntityManager entityManager) {
        this.entityManager = entityManager;
        this.hotelRepository = hotelRepository;
        this.deleteGuard = deleteGuard;
    }

    @GetMapping
    public ResponseEntity<?> getAllHotels() {
        return ResponseEntity.ok(
                hotelRepository.findAllByOrderByIdDesc().stream().filter(item -> "active".equalsIgnoreCase(item.getStatus())).toList()
        );
    }

    @PostMapping
    public ResponseEntity<?> createHotel(@RequestBody Hotel request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Vui lòng nhập tên khách sạn")
            );
        }

        com.travelai.backend.catalog.SceneValidation.validate(request.getScenes());
        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .location(request.getLocation())
                .province(request.getProvince())
                .rating(request.getRating() == null ? 5.0 : request.getRating())
                .rooms(request.getRooms() == null ? 1 : request.getRooms())
                .price(request.getPrice() == null ? 0.0 : request.getPrice())
                .status(request.getStatus() == null ? "active" : request.getStatus())
                .scenes(request.getScenes() == null ? new java.util.ArrayList<>() : request.getScenes())
                .image(request.getImage())
                .build();

        return ResponseEntity.ok(hotelRepository.save(hotel));
    }

    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updateHotel(
            @PathVariable Long id,
            @RequestBody Hotel request
    ) {
        entityManager.createNativeQuery("insert into booking_barrier(id) values (1) on conflict do nothing").executeUpdate();
        entityManager.createNativeQuery("select id from booking_barrier where id=1 for update").getSingleResult();
        entityManager.clear();
        Hotel hotel = hotelRepository.findById(id).orElse(null);

        if (hotel == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Hotel not found")
            );
        }

        com.travelai.backend.catalog.SceneValidation.validate(request.getScenes());
        if (request.getScenes() != null) hotel.setScenes(request.getScenes());
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

        if (deleteGuard.inUse(hotel)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(Map.of("message", CatalogDeleteGuard.MESSAGE));
        }

        hotelRepository.delete(hotel);

        return ResponseEntity.ok(
                Map.of("message", "Delete hotel successfully")
        );
    }

    @GetMapping("/{id}")
public ResponseEntity<?> getHotelById(@PathVariable Long id) {
    Hotel hotel = hotelRepository.findById(id).orElse(null);

    if (hotel == null || !"active".equalsIgnoreCase(hotel.getStatus())) {
        return ResponseEntity.badRequest().body(
                Map.of("message", "Hotel not found")
        );
    }

    return ResponseEntity.ok(hotel);
}
}
