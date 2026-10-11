package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.LocationRequest;
import com.travelai.core.model.entity.Location;
import com.travelai.core.repository.LocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LocationRepository locationRepository;

    private Long testLocationId;

    @BeforeEach
    void setUp() {
        // Ensure at least one known location exists for test assertions
        Location sample = locationRepository.findByNameIgnoreCase("Đà Lạt Mộng Mơ").orElseGet(() ->
                locationRepository.save(Location.builder()
                        .name("Đà Lạt Mộng Mơ")
                        .province("Lâm Đồng")
                        .description("Thành phố ngàn hoa với khí hậu mát mẻ quanh năm và thông xanh bạt ngàn.")
                        .imageUrl("https://images.unsplash.com/photo-1546484396-fb3fc6f95f98")
                        .latitude(11.9404)
                        .longitude(108.4583)
                        .category("Khí hậu & Nghỉ dưỡng")
                        .rating(4.8)
                        .reviewCount(50)
                        .build())
        );
        testLocationId = sample.getId();
    }

    @Test
    @DisplayName("GET /api/v1/locations should return paged locations list publicly")
    void testGetLocations_PublicSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/locations")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("GET /api/v1/locations with keyword should filter results")
    void testGetLocations_SearchKeyword() throws Exception {
        mockMvc.perform(get("/api/v1/locations")
                        .param("keyword", "Đà Lạt"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name", containsString("Đà Lạt")))
                .andExpect(jsonPath("$.content[0].province", is("Lâm Đồng")));
    }

    @Test
    @DisplayName("GET /api/v1/locations/{id} should return location details")
    void testGetLocationById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/locations/{id}", testLocationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testLocationId.intValue())))
                .andExpect(jsonPath("$.name", is("Đà Lạt Mộng Mơ")))
                .andExpect(jsonPath("$.province", is("Lâm Đồng")));
    }

    @Test
    @DisplayName("GET /api/v1/locations/{id} with non-existent id should return RFC 7807 404")
    void testGetLocationById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/locations/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type", is("https://travelai.vn/errors/not-found")))
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.detail", containsString("Location not found")));
    }

    @Test
    @DisplayName("POST /api/v1/locations without ADMIN role should return 401 or 403")
    void testCreateLocation_Unauthenticated() throws Exception {
        LocationRequest request = LocationRequest.builder()
                .name("Tháp Rùa")
                .province("Hà Nội")
                .build();

        mockMvc.perform(post("/api/v1/locations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/locations with ADMIN role should create location and return 201 Created")
    void testCreateLocation_AdminSuccess() throws Exception {
        String uniqueName = "Đảo Cát Bà Tuyệt Đẹp " + System.currentTimeMillis();
        LocationRequest request = LocationRequest.builder()
                .name(uniqueName)
                .province("Hải Phòng")
                .description("Hòn đảo ngọc vịnh Bắc Bộ với vườn quốc gia và bãi tắm hoang sơ.")
                .imageUrl("https://example.com/cat-ba.jpg")
                .latitude(20.7256)
                .longitude(106.9975)
                .category("Biển đảo")
                .rating(4.7)
                .build();

        mockMvc.perform(post("/api/v1/locations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is(uniqueName)))
                .andExpect(jsonPath("$.province", is("Hải Phòng")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/locations with duplicate name should return 400 Bad Request RFC 7807")
    void testCreateLocation_DuplicateName() throws Exception {
        LocationRequest request = LocationRequest.builder()
                .name("Đà Lạt Mộng Mơ")
                .province("Lâm Đồng")
                .description("Duplicate test")
                .build();

        mockMvc.perform(post("/api/v1/locations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type", is("https://travelai.vn/errors/bad-request")))
                .andExpect(jsonPath("$.detail", containsString("already exists")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("PUT /api/v1/locations/{id} should update location details")
    void testUpdateLocation_AdminSuccess() throws Exception {
        LocationRequest updateReq = LocationRequest.builder()
                .name("Đà Lạt Mộng Mơ (Cập nhật)")
                .province("Lâm Đồng")
                .description("Mô tả mới đã được cập nhật bởi quản trị viên.")
                .category("Nghỉ dưỡng cao cấp")
                .rating(4.9)
                .build();

        mockMvc.perform(put("/api/v1/locations/{id}", testLocationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Đà Lạt Mộng Mơ (Cập nhật)")))
                .andExpect(jsonPath("$.category", is("Nghỉ dưỡng cao cấp")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("DELETE /api/v1/locations/{id} should delete location and return 204 No Content")
    void testDeleteLocation_AdminSuccess() throws Exception {
        Location temp = locationRepository.save(Location.builder()
                .name("Địa danh xóa tạm")
                .province("Quảng Nam")
                .build());

        mockMvc.perform(delete("/api/v1/locations/{id}", temp.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/locations/{id}", temp.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/locations with rating > 5.0 should return 400 validation error")
    void testCreateLocation_InvalidRatingReturns400() throws Exception {
        LocationRequest request = LocationRequest.builder()
                .name("Địa danh thử nghiệm rating lỗi")
                .province("Hà Nội")
                .rating(6.5)
                .build();

        mockMvc.perform(post("/api/v1/locations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type", is("https://travelai.vn/errors/validation-error")))
                .andExpect(jsonPath("$.errors.rating", containsString("5.0")));
    }

    @Test
    @DisplayName("GET /api/v1/locations with invalid sort property should fallback gracefully")
    void testGetLocations_InvalidSortFallsBackGracefully() throws Exception {
        mockMvc.perform(get("/api/v1/locations")
                        .param("sort", "malicious_column,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())));
    }

    @Test
    @DisplayName("GET /api/v1/locations with excessive page size should be clamped safely")
    void testGetLocations_LargePageSizeClamped() throws Exception {
        mockMvc.perform(get("/api/v1/locations")
                        .param("size", "1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size", lessThanOrEqualTo(100)));
    }
}
