package com.travelai.core.service.impl;

import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.dto.response.TourResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Location;
import com.travelai.core.model.entity.Tour;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.repository.TourRepository;
import com.travelai.core.service.TourService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TourServiceImpl implements TourService {

    private static final Logger log = LoggerFactory.getLogger(TourServiceImpl.class);

    private final TourRepository tourRepository;
    private final LocationRepository locationRepository;

    public TourServiceImpl(TourRepository tourRepository, LocationRepository locationRepository) {
        this.tourRepository = tourRepository;
        this.locationRepository = locationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TourResponse> getTours(String keyword, Long locationId, String province,
                                       BigDecimal maxPrice, String duration, String status, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanProvince = (province != null && !province.trim().isEmpty()) ? province.trim() : null;
        String cleanDuration = (duration != null && !duration.trim().isEmpty()) ? duration.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : null;

        return tourRepository.searchTours(cleanKeyword, locationId, cleanProvince, maxPrice, cleanDuration, cleanStatus, pageable)
                .map(TourResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public TourResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));
        return TourResponse.fromEntity(tour);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourResponse> getToursByLocationId(Long locationId) {
        if (!locationRepository.existsById(locationId)) {
            throw new ResourceNotFoundException("Location not found with id: " + locationId);
        }
        return tourRepository.findByLocationIdAndStatus(locationId, "ACTIVE")
                .stream()
                .map(TourResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TourResponse createTour(TourRequest request) {
        String trimmedTitle = request.getTitle().trim();

        Location location = null;
        String province = request.getProvince();

        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));
            if (province == null || province.trim().isEmpty()) {
                province = location.getProvince();
            }
        }

        Tour tour = Tour.builder()
                .title(trimmedTitle)
                .description(request.getDescription())
                .location(location)
                .province(province)
                .duration(request.getDuration().trim())
                .departureDates(request.getDepartureDates())
                .price(request.getPrice())
                .currency(request.getCurrency() != null ? request.getCurrency().trim() : "VND")
                .imageUrl(request.getImageUrl())
                .highlights(request.getHighlights())
                .itinerary(request.getItinerary())
                .availableSlots(request.getAvailableSlots() != null ? request.getAvailableSlots() : 20)
                .status(request.getStatus() != null ? request.getStatus().trim() : "ACTIVE")
                .rating(5.0)
                .reviewCount(0)
                .build();

        Tour saved = tourRepository.save(tour);
        log.info("Created new tour id={} title='{}' for locationId={}", saved.getId(), saved.getTitle(), request.getLocationId());
        return TourResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public TourResponse updateTour(Long id, TourRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));

        Location location = tour.getLocation();
        String province = request.getProvince();

        if (request.getLocationId() != null) {
            if (location == null || !location.getId().equals(request.getLocationId())) {
                location = locationRepository.findById(request.getLocationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));
            }
            if (province == null || province.trim().isEmpty()) {
                province = location.getProvince();
            }
        } else {
            location = null;
        }

        tour.setTitle(request.getTitle().trim());
        tour.setDescription(request.getDescription());
        tour.setLocation(location);
        tour.setProvince(province);
        tour.setDuration(request.getDuration().trim());
        tour.setDepartureDates(request.getDepartureDates());
        tour.setPrice(request.getPrice());
        if (request.getCurrency() != null) {
            tour.setCurrency(request.getCurrency().trim());
        }
        tour.setImageUrl(request.getImageUrl());
        tour.setHighlights(request.getHighlights());
        tour.setItinerary(request.getItinerary());
        if (request.getAvailableSlots() != null) {
            tour.setAvailableSlots(request.getAvailableSlots());
        }
        if (request.getStatus() != null) {
            tour.setStatus(request.getStatus().trim());
        }

        Tour updated = tourRepository.save(tour);
        log.info("Updated tour id={} title='{}'", updated.getId(), updated.getTitle());
        return TourResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteTour(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));

        tourRepository.delete(tour);
        log.info("Deleted tour id={}", id);
    }
}
