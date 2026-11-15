package com.travelai.core.service;

import com.travelai.core.dto.request.HotelRequest;
import com.travelai.core.dto.request.PartnerStatusUpdateRequest;
import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.dto.response.HotelResponse;
import com.travelai.core.dto.response.PartnerStatsResponse;
import com.travelai.core.dto.response.TourResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface AdminPartnerService {

    PartnerStatsResponse getPartnerStats();

    Page<TourResponse> getAdminTours(String keyword, Long locationId, String province,
                                     BigDecimal minPrice, BigDecimal maxPrice,
                                     String status, Pageable pageable);

    Page<HotelResponse> getAdminHotels(String keyword, Long locationId, String province,
                                       Integer stars, BigDecimal minPrice, BigDecimal maxPrice,
                                       String status, Pageable pageable);

    TourResponse getTourById(Long id);

    TourResponse createTour(TourRequest request);

    TourResponse updateTour(Long id, TourRequest request);

    TourResponse updateTourStatus(Long id, PartnerStatusUpdateRequest request);

    void deleteTour(Long id);

    HotelResponse getHotelById(Long id);

    HotelResponse createHotel(HotelRequest request);

    HotelResponse updateHotel(Long id, HotelRequest request);

    HotelResponse updateHotelStatus(Long id, PartnerStatusUpdateRequest request);

    void deleteHotel(Long id);
}
