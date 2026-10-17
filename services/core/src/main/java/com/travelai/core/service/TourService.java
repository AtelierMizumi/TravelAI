package com.travelai.core.service;

import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.dto.response.TourResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface TourService {

    Page<TourResponse> getTours(String keyword, Long locationId, String province,
                                BigDecimal maxPrice, String duration, String status, Pageable pageable);

    TourResponse getTourById(Long id);

    List<TourResponse> getToursByLocationId(Long locationId);

    TourResponse createTour(TourRequest request);

    TourResponse updateTour(Long id, TourRequest request);

    void deleteTour(Long id);
}
