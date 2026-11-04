package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.HotelRequest;
import com.travelai.core.model.entity.Hotel;
import com.travelai.core.model.entity.Location;
import com.travelai.core.repository.HotelRepository;
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

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HotelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private LocationRepository locationRepository;

    private Long testHotelId;
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

        Hotel sampleHotel = hotelRepository.save(Hotel.builder()
                .name("Topas Ecolodge Sapa")
                .description("Khu nghỉ dưỡng sinh thái trên đồi hình nón tuyệt đẹp tại Sapa.")
                .location(sampleLoc)
                .province("Lào Cai")
                .address("Bản Lếch, Thanh Kim, Sa Pa, Lào Cai")
                .stars(5)
                .pricePerNight(new BigDecimal("3500000.00"))
                .currency("VND")
                .rating(4.9)
                .reviewCount(64)
                .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945")
                .amenities("Hồ bơi vô cực view thung lũng, Spa thảo mộc, Nhà hàng ẩm thực Tây Bắc, Wifi miễn phí")
                .phone("02439284074")
                .email("info@topasecolodge.com")
                .availableRooms(10)
                .status("ACTIVE")
                .build());

        testHotelId = sampleHotel.getId();
    }

    @Test
    @DisplayName("GET /api/v1/hotels should return paged hotels list publicly")
    void testGetHotels_PublicSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/hotels")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].name", notNullValue()))
                .andExpect(jsonPath("$.content[0].formattedPrice", notNullValue()))
                .andExpect(jsonPath("$.content[0].stars", notNullValue()))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("GET /api/v1/hotels with keyword search should filter results correctly")
    void testGetHotels_WithKeywordFilter() throws Exception {
        mockMvc.perform(get("/api/v1/hotels")
                        .param("keyword", "Topas")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].name", containsString("Topas")));
    }

    @Test
    @DisplayName("GET /api/v1/hotels with locationId filter should filter hotels of that location")
    void testGetHotels_WithLocationIdFilter() throws Exception {
        mockMvc.perform(get("/api/v1/hotels")
                        .param("locationId", testLocationId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].locationId", is(testLocationId.intValue())));
    }

    @Test
    @DisplayName("GET /api/v1/hotels with minStars filter should only return luxury hotels")
    void testGetHotels_WithMinStarsFilter() throws Exception {
        mockMvc.perform(get("/api/v1/hotels")
                        .param("minStars", "5")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].stars", greaterThanOrEqualTo(5)));
    }

    @Test
    @DisplayName("GET /api/v1/hotels with maxPrice filter should filter affordable hotels")
    void testGetHotels_WithMaxPriceFilter() throws Exception {
        mockMvc.perform(get("/api/v1/hotels")
                        .param("maxPrice", "4000000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/{id} should return hotel details publicly")
    void testGetHotelById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/hotels/{id}", testHotelId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testHotelId.intValue())))
                .andExpect(jsonPath("$.name", is("Topas Ecolodge Sapa")))
                .andExpect(jsonPath("$.province", is("Lào Cai")))
                .andExpect(jsonPath("$.stars", is(5)))
                .andExpect(jsonPath("$.formattedPrice", is("3.500.000 đ")))
                .andExpect(jsonPath("$.amenities", hasItem("Hồ bơi vô cực view thung lũng")));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/{id} should return 404 when hotel does not exist")
    void testGetHotelById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/hotels/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.detail", containsString("Hotel not found with id: 999999")));
    }

    @Test
    @DisplayName("GET /api/v1/hotels/by-location/{locationId} should return active hotels for location")
    void testGetHotelsByLocation_Success() throws Exception {
        mockMvc.perform(get("/api/v1/hotels/by-location/{locationId}", testLocationId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].locationId", is(testLocationId.intValue())));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/v1/hotels by ADMIN should successfully create a new hotel")
    void testCreateHotel_AdminSuccess() throws Exception {
        HotelRequest request = new HotelRequest(
                "Silk Path Grand Resort & Spa Sapa",
                "Khu nghỉ dưỡng 5 sao phong cách quý tộc Pháp nhìn ra dãy Hoàng Liên Sơn.",
                testLocationId,
                "Lào Cai",
                "Đồi Quan 6, Tổ 5, Sa Pa, Lào Cai",
                5,
                new BigDecimal("2800000.00"),
                "VND",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
                "Hồ bơi nước ấm 4 mùa, Spa Chi, Vườn hồng cổ, Phòng gym hiện đại",
                "02143788555",
                "reservation@silkpathhotel.com",
                25,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/hotels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Silk Path Grand Resort & Spa Sapa")))
                .andExpect(jsonPath("$.stars", is(5)))
                .andExpect(jsonPath("$.pricePerNight", is(2800000.0)))
                .andExpect(jsonPath("$.formattedPrice", is("2.800.000 đ")));
    }

    @Test
    @DisplayName("POST /api/v1/hotels unauthenticated should return 401 Unauthorized")
    void testCreateHotel_Unauthorized() throws Exception {
        HotelRequest request = new HotelRequest();
        request.setName("Unauthorized Hotel");
        request.setPricePerNight(new BigDecimal("100000.00"));

        mockMvc.perform(post("/api/v1/hotels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "regular_user", roles = {"USER"})
    @DisplayName("POST /api/v1/hotels by regular USER should return 403 Forbidden")
    void testCreateHotel_ForbiddenForUser() throws Exception {
        HotelRequest request = new HotelRequest();
        request.setName("Forbidden Hotel");
        request.setPricePerNight(new BigDecimal("100000.00"));

        mockMvc.perform(post("/api/v1/hotels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/hotels/{id} by ADMIN should update hotel details")
    void testUpdateHotel_AdminSuccess() throws Exception {
        HotelRequest updateRequest = new HotelRequest(
                "Topas Ecolodge Sapa (Updated)",
                "Khu nghỉ dưỡng sinh thái cao cấp với nhiều dịch vụ mới.",
                testLocationId,
                "Lào Cai",
                "Bản Lếch, Thanh Kim, Sa Pa, Lào Cai",
                5,
                new BigDecimal("3800000.00"),
                "VND",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945",
                "Hồ bơi vô cực, Spa thảo mộc, Tour trekking bản làng",
                "02439284074",
                "info@topasecolodge.com",
                8,
                "ACTIVE"
        );

        mockMvc.perform(put("/api/v1/hotels/{id}", testHotelId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testHotelId.intValue())))
                .andExpect(jsonPath("$.name", is("Topas Ecolodge Sapa (Updated)")))
                .andExpect(jsonPath("$.formattedPrice", is("3.800.000 đ")))
                .andExpect(jsonPath("$.availableRooms", is(8)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("DELETE /api/v1/hotels/{id} by ADMIN should delete hotel and return 204")
    void testDeleteHotel_AdminSuccess() throws Exception {
        Hotel toDelete = hotelRepository.save(Hotel.builder()
                .name("Khách Sạn Sẽ Bị Xóa")
                .pricePerNight(new BigDecimal("500000.00"))
                .stars(3)
                .status("ACTIVE")
                .build());

        mockMvc.perform(delete("/api/v1/hotels/{id}", toDelete.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/hotels/{id}", toDelete.getId()))
                .andExpect(status().isNotFound());
    }
}
