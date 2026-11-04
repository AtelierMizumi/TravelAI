package com.travelai.core.service.impl;

import com.travelai.core.dto.request.HotelRequest;
import com.travelai.core.dto.response.HotelResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Hotel;
import com.travelai.core.model.entity.Location;
import com.travelai.core.repository.HotelRepository;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.service.HotelService;
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
public class HotelServiceImpl implements HotelService {

    private static final Logger log = LoggerFactory.getLogger(HotelServiceImpl.class);

    private final HotelRepository hotelRepository;
    private final LocationRepository locationRepository;

    public HotelServiceImpl(HotelRepository hotelRepository, LocationRepository locationRepository) {
        this.hotelRepository = hotelRepository;
        this.locationRepository = locationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponse> getHotels(String keyword, Long locationId, String province,
                                         Integer minStars, BigDecimal maxPrice, String status, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanProvince = (province != null && !province.trim().isEmpty()) ? province.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : null;

        return hotelRepository.searchHotels(cleanKeyword, locationId, cleanProvince, minStars, maxPrice, cleanStatus, pageable)
                .map(HotelResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return HotelResponse.fromEntity(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelResponse> getHotelsByLocationId(Long locationId) {
        if (!locationRepository.existsById(locationId)) {
            throw new ResourceNotFoundException("Location not found with id: " + locationId);
        }
        return hotelRepository.findByLocationIdAndStatus(locationId, "ACTIVE")
                .stream()
                .map(HotelResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HotelResponse createHotel(HotelRequest request) {
        String trimmedName = request.getName().trim();

        Location location = null;
        String province = request.getProvince();

        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));
            if (province == null || province.trim().isEmpty()) {
                province = location.getProvince();
            }
        }

        Hotel hotel = Hotel.builder()
                .name(trimmedName)
                .description(request.getDescription())
                .location(location)
                .province(province)
                .address(request.getAddress())
                .stars(request.getStars() != null ? request.getStars() : 3)
                .pricePerNight(request.getPricePerNight())
                .currency(request.getCurrency() != null ? request.getCurrency().trim() : "VND")
                .imageUrl(request.getImageUrl())
                .amenities(request.getAmenities())
                .phone(request.getPhone())
                .email(request.getEmail())
                .availableRooms(request.getAvailableRooms() != null ? request.getAvailableRooms() : 10)
                .status(request.getStatus() != null ? request.getStatus().trim() : "ACTIVE")
                .rating(5.0)
                .reviewCount(0)
                .build();

        Hotel saved = hotelRepository.save(hotel);
        log.info("Created new hotel id={} name='{}' for locationId={}", saved.getId(), saved.getName(), request.getLocationId());
        return HotelResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public HotelResponse updateHotel(Long id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        Location location = hotel.getLocation();
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

        hotel.setName(request.getName().trim());
        hotel.setDescription(request.getDescription());
        hotel.setLocation(location);
        hotel.setProvince(province);
        hotel.setAddress(request.getAddress());
        if (request.getStars() != null) {
            hotel.setStars(request.getStars());
        }
        hotel.setPricePerNight(request.getPricePerNight());
        if (request.getCurrency() != null) {
            hotel.setCurrency(request.getCurrency().trim());
        }
        hotel.setImageUrl(request.getImageUrl());
        hotel.setAmenities(request.getAmenities());
        hotel.setPhone(request.getPhone());
        hotel.setEmail(request.getEmail());
        if (request.getAvailableRooms() != null) {
            hotel.setAvailableRooms(request.getAvailableRooms());
        }
        if (request.getStatus() != null) {
            hotel.setStatus(request.getStatus().trim());
        }

        Hotel updated = hotelRepository.save(hotel);
        log.info("Updated hotel id={} name='{}'", updated.getId(), updated.getName());
        return HotelResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        hotelRepository.delete(hotel);
        log.info("Deleted hotel id={}", id);
    }
}
