package com.travelai.backend.controller;

import com.travelai.backend.entity.Tour;
import com.travelai.backend.repository.TourRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private final TourRepository tourRepository;

    public TourController(TourRepository tourRepository) {
        this.tourRepository = tourRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllTours() {
        return ResponseEntity.ok(
                tourRepository.findAllByOrderByIdDesc()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTourById(@PathVariable Long id) {
        Tour tour = tourRepository.findById(id).orElse(null);

        if (tour == null) {
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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTour(
            @PathVariable Long id,
            @RequestBody Tour request
    ) {
        Tour tour = tourRepository.findById(id).orElse(null);

        if (tour == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Tour not found")
            );
        }

        tour.setName(request.getName());
        tour.setLocation(request.getLocation());
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

        tourRepository.delete(tour);

        return ResponseEntity.ok(
                Map.of("message", "Delete tour successfully")
        );
    }
}