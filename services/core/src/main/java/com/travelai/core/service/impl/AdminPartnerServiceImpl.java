package com.travelai.core.service.impl;

import com.travelai.core.dto.request.HotelRequest;
import com.travelai.core.dto.request.PartnerStatusUpdateRequest;
import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.dto.response.HotelResponse;
import com.travelai.core.dto.response.PartnerStatsResponse;
import com.travelai.core.dto.response.TourResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.Hotel;
import com.travelai.core.model.entity.Location;
import com.travelai.core.model.entity.Tour;
import com.travelai.core.repository.BookingDetailRepository;
import com.travelai.core.repository.HotelRepository;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.repository.TourRepository;
import com.travelai.core.service.AdminPartnerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminPartnerServiceImpl implements AdminPartnerService {

    private static final Logger log = LoggerFactory.getLogger(AdminPartnerServiceImpl.class);

    private final TourRepository tourRepository;
    private final HotelRepository hotelRepository;
    private final LocationRepository locationRepository;
    private final BookingDetailRepository bookingDetailRepository;

    public AdminPartnerServiceImpl(TourRepository tourRepository,
                                   HotelRepository hotelRepository,
                                   LocationRepository locationRepository,
                                   BookingDetailRepository bookingDetailRepository) {
        this.tourRepository = tourRepository;
        this.hotelRepository = hotelRepository;
        this.locationRepository = locationRepository;
        this.bookingDetailRepository = bookingDetailRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerStatsResponse getPartnerStats() {
        long totalTours = tourRepository.count();
        long activeTours = tourRepository.countByStatus("ACTIVE");
        long inactiveTours = tourRepository.countByStatus("INACTIVE");
        long suspendedTours = tourRepository.countByStatus("SUSPENDED");

        long totalHotels = hotelRepository.count();
        long activeHotels = hotelRepository.countByStatus("ACTIVE");
        long inactiveHotels = hotelRepository.countByStatus("INACTIVE");
        long suspendedHotels = hotelRepository.countByStatus("SUSPENDED");

        long totalServices = totalTours + totalHotels;
        long totalTourSlots = tourRepository.sumActiveAvailableSlots();
        long totalHotelRooms = hotelRepository.sumActiveAvailableRooms();

        long tourLocations = tourRepository.countDistinctLocationsWithTours();
        long hotelLocations = hotelRepository.countDistinctLocationsWithHotels();
        long totalLocationsWithServices = Math.max(tourLocations, hotelLocations);

        // Aggregate services by province
        Map<String, long[]> provinceMap = new LinkedHashMap<>();
        List<Object[]> tourProvinces = tourRepository.countToursByProvince();
        if (tourProvinces != null) {
            for (Object[] row : tourProvinces) {
                String prov = (String) row[0];
                long count = ((Number) row[1]).longValue();
                if (prov != null && !prov.isBlank()) {
                    provinceMap.computeIfAbsent(prov, k -> new long[]{0, 0})[0] += count;
                }
            }
        }

        List<Object[]> hotelProvinces = hotelRepository.countHotelsByProvince();
        if (hotelProvinces != null) {
            for (Object[] row : hotelProvinces) {
                String prov = (String) row[0];
                long count = ((Number) row[1]).longValue();
                if (prov != null && !prov.isBlank()) {
                    provinceMap.computeIfAbsent(prov, k -> new long[]{0, 0})[1] += count;
                }
            }
        }

        List<PartnerStatsResponse.ProvinceServiceCount> provinceCounts = new ArrayList<>();
        for (Map.Entry<String, long[]> entry : provinceMap.entrySet()) {
            provinceCounts.add(new PartnerStatsResponse.ProvinceServiceCount(
                    entry.getKey(),
                    entry.getValue()[0],
                    entry.getValue()[1]
            ));
        }

        return new PartnerStatsResponse(
                totalTours, activeTours, inactiveTours, suspendedTours,
                totalHotels, activeHotels, inactiveHotels, suspendedHotels,
                totalServices, totalLocationsWithServices,
                totalTourSlots, totalHotelRooms,
                provinceCounts
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TourResponse> getAdminTours(String keyword, Long locationId, String province,
                                            BigDecimal minPrice, BigDecimal maxPrice,
                                            String status, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanProvince = (province != null && !province.trim().isEmpty()) ? province.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : null;

        Page<Tour> toursPage = tourRepository.searchTours(cleanKeyword, locationId, cleanProvince, maxPrice, null, cleanStatus, pageable);

        if (minPrice != null) {
            List<TourResponse> filtered = toursPage.getContent().stream()
                    .filter(t -> t.getPrice() != null && t.getPrice().compareTo(minPrice) >= 0)
                    .map(TourResponse::fromEntity)
                    .collect(Collectors.toList());
            return new PageImpl<>(filtered, pageable, toursPage.getTotalElements());
        }

        return toursPage.map(TourResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HotelResponse> getAdminHotels(String keyword, Long locationId, String province,
                                              Integer stars, BigDecimal minPrice, BigDecimal maxPrice,
                                              String status, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanProvince = (province != null && !province.trim().isEmpty()) ? province.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty()) ? status.trim() : null;

        Page<Hotel> hotelsPage = hotelRepository.searchHotels(cleanKeyword, locationId, cleanProvince, stars, maxPrice, cleanStatus, pageable);

        if (minPrice != null) {
            List<HotelResponse> filtered = hotelsPage.getContent().stream()
                    .filter(h -> h.getPricePerNight() != null && h.getPricePerNight().compareTo(minPrice) >= 0)
                    .map(HotelResponse::fromEntity)
                    .collect(Collectors.toList());
            return new PageImpl<>(filtered, pageable, hotelsPage.getTotalElements());
        }

        return hotelsPage.map(HotelResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public TourResponse getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));
        return TourResponse.fromEntity(tour);
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
        log.info("Admin created new partner tour id={} title='{}'", saved.getId(), saved.getTitle());
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
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));
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

        Tour saved = tourRepository.save(tour);
        log.info("Admin updated partner tour id={} title='{}'", saved.getId(), saved.getTitle());
        return TourResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public TourResponse updateTourStatus(Long id, PartnerStatusUpdateRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));

        String oldStatus = tour.getStatus();
        tour.setStatus(request.getStatus().trim());
        Tour saved = tourRepository.save(tour);
        log.info("Admin changed partner tour id={} status from '{}' to '{}' reason='{}'",
                saved.getId(), oldStatus, saved.getStatus(), request.getReason());
        return TourResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteTour(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));

        if (bookingDetailRepository.existsByTourId(id)) {
            throw new BadRequestException("Không thể xóa Tour vì đã phát sinh đơn đặt chỗ trong hệ thống. Vui lòng cập nhật trạng thái sang INACTIVE hoặc SUSPENDED.");
        }

        tourRepository.delete(tour);
        log.info("Admin deleted partner tour id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return HotelResponse.fromEntity(hotel);
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
        log.info("Admin created new partner hotel id={} name='{}'", saved.getId(), saved.getName());
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
            location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + request.getLocationId()));
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

        Hotel saved = hotelRepository.save(hotel);
        log.info("Admin updated partner hotel id={} name='{}'", saved.getId(), saved.getName());
        return HotelResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public HotelResponse updateHotelStatus(Long id, PartnerStatusUpdateRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        String oldStatus = hotel.getStatus();
        hotel.setStatus(request.getStatus().trim());
        Hotel saved = hotelRepository.save(hotel);
        log.info("Admin changed partner hotel id={} status from '{}' to '{}' reason='{}'",
                saved.getId(), oldStatus, saved.getStatus(), request.getReason());
        return HotelResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        if (bookingDetailRepository.existsByHotelId(id)) {
            throw new BadRequestException("Không thể xóa Khách sạn vì đã phát sinh đơn đặt chỗ trong hệ thống. Vui lòng cập nhật trạng thái sang INACTIVE hoặc SUSPENDED.");
        }

        hotelRepository.delete(hotel);
        log.info("Admin deleted partner hotel id={}", id);
    }
}
