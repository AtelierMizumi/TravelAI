package com.travelai.core.controller;

import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.dto.response.TourResponse;
import com.travelai.core.service.TourService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tours")
public class TourController {

    private final TourService tourService;

    public TourController(TourService tourService) {
        this.tourService = tourService;
    }

    @GetMapping
    public ResponseEntity<Page<TourResponse>> getTours(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false, defaultValue = "ACTIVE") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TourResponse> tours = tourService.getTours(keyword, locationId, province, maxPrice, duration, status, pageable);
        return ResponseEntity.ok(tours);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourResponse> getTourById(@PathVariable Long id) {
        TourResponse tour = tourService.getTourById(id);
        return ResponseEntity.ok(tour);
    }

    @GetMapping("/by-location/{locationId}")
    public ResponseEntity<List<TourResponse>> getToursByLocation(@PathVariable Long locationId) {
        List<TourResponse> tours = tourService.getToursByLocationId(locationId);
        return ResponseEntity.ok(tours);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourResponse> createTour(@Valid @RequestBody TourRequest request) {
        TourResponse created = tourService.createTour(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable Long id,
            @Valid @RequestBody TourRequest request
    ) {
        TourResponse updated = tourService.updateTour(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.noContent().build();
    }
}
