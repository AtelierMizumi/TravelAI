package com.travelai.core.service;

import com.travelai.core.dto.request.LocationRequest;
import com.travelai.core.dto.response.LocationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LocationService {

    Page<LocationResponse> getLocations(String keyword, String province, String category, Pageable pageable);

    LocationResponse getLocationById(Long id);

    LocationResponse createLocation(LocationRequest request);

    LocationResponse updateLocation(Long id, LocationRequest request);

    void deleteLocation(Long id);
}
