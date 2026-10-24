package com.travelai.core.service;

import com.travelai.core.dto.request.HotelRequest;
import com.travelai.core.dto.response.HotelResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface HotelService {

    Page<HotelResponse> getHotels(String keyword, Long locationId, String province,
                                  Integer minStars, BigDecimal maxPrice, String status, Pageable pageable);

    HotelResponse getHotelById(Long id);

    List<HotelResponse> getHotelsByLocationId(Long locationId);

    HotelResponse createHotel(HotelRequest request);

    HotelResponse updateHotel(Long id, HotelRequest request);

    void deleteHotel(Long id);
}
