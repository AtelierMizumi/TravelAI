package com.travelai.core.service.impl;

import com.travelai.core.dto.request.LocationRequest;
import com.travelai.core.dto.response.LocationResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Location;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.service.LocationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationServiceImpl implements LocationService {

    private static final Logger log = LoggerFactory.getLogger(LocationServiceImpl.class);

    private final LocationRepository locationRepository;

    public LocationServiceImpl(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LocationResponse> getLocations(String keyword, String province, String category, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanProvince = (province != null && !province.trim().isEmpty()) ? province.trim() : null;
        String cleanCategory = (category != null && !category.trim().isEmpty()) ? category.trim() : null;

        return locationRepository.searchLocations(cleanKeyword, cleanProvince, cleanCategory, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        return mapToResponse(location);
    }

    @Override
    @Transactional
    public LocationResponse createLocation(LocationRequest request) {
        String trimmedName = request.getName().trim();

        if (locationRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new BadRequestException("Location with name '" + trimmedName + "' already exists in database!");
        }

        Location location = Location.builder()
                .name(trimmedName)
                .province(request.getProvince().trim())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .category(request.getCategory() != null ? request.getCategory().trim() : "Danh lam thắng cảnh")
                .rating(request.getRating() != null ? request.getRating() : 5.0)
                .reviewCount(0)
                .build();

        Location savedLocation = locationRepository.save(location);
        log.info("Created new location id={}, name={}", savedLocation.getId(), savedLocation.getName());

        return mapToResponse(savedLocation);
    }

    @Override
    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        String trimmedName = request.getName().trim();
        if (!location.getName().equalsIgnoreCase(trimmedName) && locationRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new BadRequestException("Another location with name '" + trimmedName + "' already exists!");
        }

        location.setName(trimmedName);
        location.setProvince(request.getProvince().trim());
        location.setDescription(request.getDescription());
        location.setImageUrl(request.getImageUrl());
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        if (request.getCategory() != null) {
            location.setCategory(request.getCategory().trim());
        }
        if (request.getRating() != null) {
            location.setRating(request.getRating());
        }

        Location updatedLocation = locationRepository.save(location);
        log.info("Updated location id={}, name={}", updatedLocation.getId(), updatedLocation.getName());

        return mapToResponse(updatedLocation);
    }

    @Override
    @Transactional
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        locationRepository.delete(location);
        log.info("Deleted location id={}, name={}", id, location.getName());
    }

    private LocationResponse mapToResponse(Location location) {
        return LocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .province(location.getProvince())
                .description(location.getDescription())
                .imageUrl(location.getImageUrl())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .category(location.getCategory())
                .rating(location.getRating())
                .reviewCount(location.getReviewCount())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}
