package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.model.entity.Location;
import com.travelai.core.model.entity.Tour;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.repository.TourRepository;
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

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TourControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private LocationRepository locationRepository;

    private Long testTourId;
    private Long testLocationId;

    @BeforeEach
    void setUp() {
        Location sampleLoc = locationRepository.findByNameIgnoreCase("Sapa Mù Sương").orElseGet(() ->
                locationRepository.save(Location.builder()
                        .name("Sapa Mù Sương")
                        .province("Lào Cai")
                        .description("Thị trấn trong sương với đỉnh Fansipan hùng vĩ và ruộng bậc thang kỳ ảo.")
                        .category("Núi rừng & Nghỉ dưỡng")
                        .latitude(22.3364)
                        .longitude(103.8438)
                        .build())
        );
        testLocationId = sampleLoc.getId();

        Tour sampleTour = tourRepository.save(Tour.builder()
                .title("Tour Khám Phá Fansipan Nóc Nhà Đông Dương 2N1Đ")
                .description("Chinh phục đỉnh Fansipan bằng cáp treo 3 dây, khám phá bản Cát Cát và thưởng thức lẩu cá tầm.")
                .location(sampleLoc)
                .province("Lào Cai")
                .duration("2 ngày 1 đêm")
                .departureDates("Thứ 6 hàng tuần")
                .price(new BigDecimal("1850000.00"))
                .currency("VND")
                .rating(4.9)
                .reviewCount(32)
                .highlights("Vé cáp treo Fansipan, Hướng dẫn viên bản địa, Khách sạn trung tâm Sapa")
                .itinerary("Ngày 1: Hà Nội - Sapa - Bản Cát Cát; Ngày 2: Đỉnh Fansipan - Hà Nội")
                .availableSlots(15)
                .status("ACTIVE")
                .build());

        testTourId = sampleTour.getId();
    }

    @Test
    @DisplayName("GET /api/v1/tours should return paged tours list publicly")
    void testGetTours_PublicSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/tours")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].title", notNullValue()))
                .andExpect(jsonPath("$.content[0].formattedPrice", notNullValue()))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("GET /api/v1/tours with keyword search should filter results correctly")
    void testGetTours_WithKeywordFilter() throws Exception {
        mockMvc.perform(get("/api/v1/tours")
                        .param("keyword", "Fansipan")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].title", containsString("Fansipan")));
    }

    @Test
    @DisplayName("GET /api/v1/tours with locationId filter should filter tours of that location")
    void testGetTours_WithLocationIdFilter() throws Exception {
        mockMvc.perform(get("/api/v1/tours")
                        .param("locationId", testLocationId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].locationId", is(testLocationId.intValue())));
    }

    @Test
    @DisplayName("GET /api/v1/tours with maxPrice filter should only return affordable tours")
    void testGetTours_WithMaxPriceFilter() throws Exception {
        mockMvc.perform(get("/api/v1/tours")
                        .param("maxPrice", "2000000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())));
    }

    @Test
    @DisplayName("GET /api/v1/tours/{id} should return tour details publicly")
    void testGetTourById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/tours/{id}", testTourId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testTourId.intValue())))
                .andExpect(jsonPath("$.title", is("Tour Khám Phá Fansipan Nóc Nhà Đông Dương 2N1Đ")))
                .andExpect(jsonPath("$.province", is("Lào Cai")))
                .andExpect(jsonPath("$.formattedPrice", is("1.850.000 đ")))
                .andExpect(jsonPath("$.highlights", hasItem("Vé cáp treo Fansipan")));
    }

    @Test
    @DisplayName("GET /api/v1/tours/{id} should return 404 when tour does not exist")
    void testGetTourById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/tours/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.detail", containsString("Tour not found with id: 999999")));
    }

    @Test
    @DisplayName("GET /api/v1/tours/by-location/{locationId} should return active tours for location")
    void testGetToursByLocation_Success() throws Exception {
        mockMvc.perform(get("/api/v1/tours/by-location/{locationId}", testLocationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].locationId", is(testLocationId.intValue())));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/v1/tours by ADMIN should successfully create a new tour")
    void testCreateTour_AdminSuccess() throws Exception {
        TourRequest request = new TourRequest(
                "Tour Khám Phá Mù Cang Chải Mùa Lúa Chín 3N2Đ",
                "Trải nghiệm đèo Khau Phạ và ngắm đồi mâm xôi, ruộng bậc thang tuyệt mỹ.",
                testLocationId,
                "Yên Bái",
                "3 ngày 2 đêm",
                "Thứ 6 hàng tuần tháng 9-10",
                new BigDecimal("2650000.00"),
                "VND",
                "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9",
                "Đèo Khau Phạ, Đồi mâm xôi, Đặc sản nếp Tú Lệ",
                "Ngày 1: Hà Nội - Nghĩa Lộ; Ngày 2: Mù Cang Chải; Ngày 3: Trở về Hà Nội",
                20,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Tour Khám Phá Mù Cang Chải Mùa Lúa Chín 3N2Đ")))
                .andExpect(jsonPath("$.price", is(2650000.0)))
                .andExpect(jsonPath("$.formattedPrice", is("2.650.000 đ")));
    }

    @Test
    @DisplayName("POST /api/v1/tours unauthenticated should return 401 Unauthorized")
    void testCreateTour_Unauthorized() throws Exception {
        TourRequest request = new TourRequest();
        request.setTitle("Unauthorized Tour");
        request.setDuration("1 ngày");
        request.setPrice(new BigDecimal("100000.00"));

        mockMvc.perform(post("/api/v1/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "regular_user", roles = {"USER"})
    @DisplayName("POST /api/v1/tours by regular USER should return 403 Forbidden")
    void testCreateTour_ForbiddenForUser() throws Exception {
        TourRequest request = new TourRequest();
        request.setTitle("Forbidden Tour");
        request.setDuration("1 ngày");
        request.setPrice(new BigDecimal("100000.00"));

        mockMvc.perform(post("/api/v1/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("DELETE /api/v1/tours/{id} by ADMIN should delete tour and return 204")
    void testDeleteTour_AdminSuccess() throws Exception {
        Tour toDelete = tourRepository.save(Tour.builder()
                .title("Tour Sẽ Bị Xóa")
                .duration("1 ngày")
                .price(new BigDecimal("500000.00"))
                .status("ACTIVE")
                .build());

        mockMvc.perform(delete("/api/v1/tours/{id}", toDelete.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/tours/{id}", toDelete.getId()))
                .andExpect(status().isNotFound());
    }
}
