package com.travelai.backend.controller;

import com.travelai.backend.catalog.CatalogDeleteGuard;
import com.travelai.backend.entity.Tour;
import com.travelai.backend.repository.TourRepository;
import jakarta.persistence.EntityManager;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private final TourRepository tourRepository;
    private final CatalogDeleteGuard deleteGuard;
    private final EntityManager entityManager;

    public TourController(TourRepository tourRepository, CatalogDeleteGuard deleteGuard, EntityManager entityManager) {
        this.entityManager = entityManager;
        this.tourRepository = tourRepository;
        this.deleteGuard = deleteGuard;
    }

    @GetMapping
    public ResponseEntity<?> getAllTours() {
        return ResponseEntity.ok(
                tourRepository.findAllByOrderByIdDesc().stream().filter(item -> "active".equalsIgnoreCase(item.getStatus())).toList()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTourById(@PathVariable Long id) {
        Tour tour = tourRepository.findById(id).orElse(null);

        if (tour == null || !"active".equalsIgnoreCase(tour.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Tour not found")
            );
        }

        return ResponseEntity.ok(tour);
    }

    @PostMapping
    public ResponseEntity<?> createTour(@RequestBody Tour request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Vui lòng nhập tên tour")
            );
        }

        Tour tour = Tour.builder()
                .name(request.getName())
                .location(request.getLocation())
                .province(request.getProvince())
                .rating(request.getRating() == null ? 5.0 : request.getRating())
                .price(request.getPrice() == null ? 0.0 : request.getPrice())
                .durationDays(request.getDurationDays() == null ? 1 : request.getDurationDays())
                .maxGuests(request.getMaxGuests() == null ? 1 : request.getMaxGuests())
                .status(request.getStatus() == null ? "active" : request.getStatus())
                .description(request.getDescription())
                .image(request.getImage())
                .build();

        return ResponseEntity.ok(tourRepository.save(tour));
    }

    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTour(
            @PathVariable Long id,
            @RequestBody Tour request
    ) {
        entityManager.createNativeQuery("insert into booking_barrier(id) values (1) on conflict do nothing").executeUpdate();
        entityManager.createNativeQuery("select id from booking_barrier where id=1 for update").getSingleResult();
        entityManager.clear();
        Tour tour = tourRepository.findById(id).orElse(null);

        if (tour == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Tour not found")
            );
        }

        tour.setName(request.getName());
        tour.setLocation(request.getLocation());
        if (request.getProvince() != null) tour.setProvince(request.getProvince());
        tour.setRating(request.getRating());
        tour.setPrice(request.getPrice());
        tour.setDurationDays(request.getDurationDays());
        tour.setMaxGuests(request.getMaxGuests());
        tour.setStatus(request.getStatus());
        tour.setDescription(request.getDescription());
        tour.setImage(request.getImage());

        return ResponseEntity.ok(tourRepository.save(tour));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTour(@PathVariable Long id) {
        Tour tour = tourRepository.findById(id).orElse(null);

        if (tour == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Tour not found")
            );
        }

        if (deleteGuard.inUse(tour)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                    .body(Map.of("message", CatalogDeleteGuard.MESSAGE));
        }

        tourRepository.delete(tour);

        return ResponseEntity.ok(
                Map.of("message", "Delete tour successfully")
        );
    }
}