package com.travelai.core.controller;

import com.travelai.core.dto.request.HotelRequest;
import com.travelai.core.dto.request.PartnerStatusUpdateRequest;
import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.dto.response.HotelResponse;
import com.travelai.core.dto.response.PartnerStatsResponse;
import com.travelai.core.dto.response.TourResponse;
import com.travelai.core.service.AdminPartnerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/admin/partners")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPartnerController {

    private final AdminPartnerService adminPartnerService;

    public AdminPartnerController(AdminPartnerService adminPartnerService) {
        this.adminPartnerService = adminPartnerService;
    }

    @GetMapping("/stats")
    public ResponseEntity<PartnerStatsResponse> getPartnerStats() {
        PartnerStatsResponse stats = adminPartnerService.getPartnerStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/tours")
    public ResponseEntity<Page<TourResponse>> getAdminTours(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TourResponse> tours = adminPartnerService.getAdminTours(keyword, locationId, province, minPrice, maxPrice, status, pageable);
        return ResponseEntity.ok(tours);
    }

    @GetMapping("/tours/{id}")
    public ResponseEntity<TourResponse> getTourById(@PathVariable Long id) {
        TourResponse tour = adminPartnerService.getTourById(id);
        return ResponseEntity.ok(tour);
    }

    @PostMapping("/tours")
    public ResponseEntity<TourResponse> createTour(@Valid @RequestBody TourRequest request) {
        TourResponse created = adminPartnerService.createTour(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/tours/{id}")
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable Long id,
            @Valid @RequestBody TourRequest request
    ) {
        TourResponse updated = adminPartnerService.updateTour(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/tours/{id}/status")
    public ResponseEntity<TourResponse> updateTourStatus(
            @PathVariable Long id,
            @Valid @RequestBody PartnerStatusUpdateRequest request
    ) {
        TourResponse updated = adminPartnerService.updateTourStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/tours/{id}")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        adminPartnerService.deleteTour(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/hotels")
    public ResponseEntity<Page<HotelResponse>> getAdminHotels(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) Integer stars,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<HotelResponse> hotels = adminPartnerService.getAdminHotels(keyword, locationId, province, stars, minPrice, maxPrice, status, pageable);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/hotels/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        HotelResponse hotel = adminPartnerService.getHotelById(id);
        return ResponseEntity.ok(hotel);
    }

    @PostMapping("/hotels")
    public ResponseEntity<HotelResponse> createHotel(@Valid @RequestBody HotelRequest request) {
        HotelResponse created = adminPartnerService.createHotel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/hotels/{id}")
    public ResponseEntity<HotelResponse> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelRequest request
    ) {
        HotelResponse updated = adminPartnerService.updateHotel(id, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/hotels/{id}/status")
    public ResponseEntity<HotelResponse> updateHotelStatus(
            @PathVariable Long id,
            @Valid @RequestBody PartnerStatusUpdateRequest request
    ) {
        HotelResponse updated = adminPartnerService.updateHotelStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        adminPartnerService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}
