package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.HotelRequest;
import com.travelai.core.dto.request.PartnerStatusUpdateRequest;
import com.travelai.core.dto.request.TourRequest;
import com.travelai.core.model.entity.*;
import com.travelai.core.repository.*;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminPartnerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingDetailRepository bookingDetailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private Location testLocation;
    private Tour testTour;
    private Hotel testHotel;
    private User testUser;

    @BeforeEach
    void setUp() {
        testLocation = locationRepository.findByNameIgnoreCase("Đà Lạt Ngàn Hoa").orElseGet(() ->
                locationRepository.save(Location.builder()
                        .name("Đà Lạt Ngàn Hoa")
                        .province("Lâm Đồng")
                        .description("Thành phố sương mù với ngàn hoa rực rỡ và đồi thông thơ mộng.")
                        .category("Cao nguyên & Nghỉ dưỡng")
                        .latitude(11.9404)
                        .longitude(108.4583)
                        .build())
        );

        testTour = tourRepository.save(Tour.builder()
                .title("Tour Săn Mây Đồi Đa Phú & Thung Lũng Đèn 1N")
                .description("Ngắm bình minh biển mây Đa Phú và check-in thung lũng đèn rực rỡ về đêm.")
                .location(testLocation)
                .province("Lâm Đồng")
                .duration("1 ngày")
                .departureDates("Hàng ngày từ 04:30")
                .price(new BigDecimal("450000.00"))
                .currency("VND")
                .rating(4.8)
                .reviewCount(20)
                .availableSlots(25)
                .status("ACTIVE")
                .build());

        testHotel = hotelRepository.save(Hotel.builder()
                .name("Dalat Palace Heritage Hotel")
                .description("Khách sạn di sản 5 sao đậm nét kiến trúc Pháp cổ nhìn ra hồ Xuân Hương.")
                .location(testLocation)
                .province("Lâm Đồng")
                .address("2 Đường Trần Phú, Phường 3, Đà Lạt")
                .stars(5)
                .pricePerNight(new BigDecimal("2800000.00"))
                .currency("VND")
                .rating(4.9)
                .reviewCount(45)
                .availableRooms(15)
                .status("ACTIVE")
                .build());

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));

        testUser = userRepository.findByUsername("partner_test_user").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("partner_test_user")
                        .email("partner_test_user@example.com")
                        .password("hashed_password")
                        .fullName("Người Dùng Test")
                        .role(userRole)
                        .enabled(true)
                        .build())
        );
    }

    @Test
    @DisplayName("GET /api/v1/admin/partners/stats - Anonymous returns 401 Unauthorized")
    void testGetStats_AnonymousUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/partners/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/admin/partners/stats - Regular user returns 403 Forbidden")
    @WithMockUser(username = "user", roles = "USER")
    void testGetStats_UserForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/partners/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/admin/partners/stats - Admin returns partner statistics")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testGetStats_AdminSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/partners/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTours", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.activeTours", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalHotels", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.activeHotels", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalServices", greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.servicesByProvince", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/admin/partners/tours - Admin gets paged partner tours")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testGetAdminTours_Success() throws Exception {
        mockMvc.perform(get("/api/v1/admin/partners/tours")
                        .param("status", "ACTIVE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].title", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/admin/partners/tours - Admin creates tour with valid location")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testCreateTour_Success() throws Exception {
        TourRequest request = new TourRequest(
                "Tour Khám Phá Thác Datanla Mạo Hiểm 1N",
                "Trải nghiệm đu dây vượt thác và máng trượt xuyên rừng thông Datanla.",
                testLocation.getId(),
                "Lâm Đồng",
                "1 ngày",
                "Hàng ngày",
                new BigDecimal("650000.00"),
                "VND",
                "https://example.com/datanla.jpg",
                "Máng trượt dài nhất ĐNA, Đu dây vượt thác",
                "08:00 Đón khách - 09:00 Vượt thác - 15:00 Kết thúc",
                30,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/admin/partners/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.title", is("Tour Khám Phá Thác Datanla Mạo Hiểm 1N")))
                .andExpect(jsonPath("$.locationId", is(testLocation.getId().intValue())))
                .andExpect(jsonPath("$.province", is("Lâm Đồng")));
    }

    @Test
    @DisplayName("POST /api/v1/admin/partners/tours - Returns 404 when locationId does not exist")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testCreateTour_LocationNotFound() throws Exception {
        TourRequest request = new TourRequest(
                "Tour Không Tồn Tại",
                "Mô tả tour",
                999999L,
                "Lâm Đồng",
                "1 ngày",
                "Hàng ngày",
                new BigDecimal("500000.00"),
                "VND",
                null, null, null, 20, "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/admin/partners/tours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.detail", containsString("Location not found with id: 999999")));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/partners/tours/{id}/status - Admin updates tour status")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testUpdateTourStatus_Success() throws Exception {
        PartnerStatusUpdateRequest request = new PartnerStatusUpdateRequest("INACTIVE", "Tạm dừng bảo trì tuyến đường");

        mockMvc.perform(put("/api/v1/admin/partners/tours/" + testTour.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testTour.getId().intValue())))
                .andExpect(jsonPath("$.status", is("INACTIVE")));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/partners/tours/{id}/status - Returns 400 for invalid status value")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testUpdateTourStatus_InvalidStatus() throws Exception {
        PartnerStatusUpdateRequest request = new PartnerStatusUpdateRequest("WRONG_STATUS");

        mockMvc.perform(put("/api/v1/admin/partners/tours/" + testTour.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/partners/tours/{id} - Delete succeeds when no booking exists")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testDeleteTour_Success() throws Exception {
        Tour tourToDelete = tourRepository.save(Tour.builder()
                .title("Tour Thử Nghiệm Xóa")
                .duration("1 ngày")
                .price(new BigDecimal("100000.00"))
                .currency("VND")
                .availableSlots(10)
                .status("ACTIVE")
                .build());

        mockMvc.perform(delete("/api/v1/admin/partners/tours/" + tourToDelete.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/partners/tours/{id} - Returns 400 Bad Request if booking exists")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testDeleteTour_WithExistingBooking_BadRequest() throws Exception {
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("BK-PARTNER-TEST-" + System.currentTimeMillis())
                .user(testUser)
                .bookingType("TOUR")
                .status("PENDING")
                .totalAmount(new BigDecimal("450000.00"))
                .contactName("Khách Hàng Test")
                .contactEmail("partner_test_user@example.com")
                .contactPhone("0901234567")
                .startDate(LocalDate.now().plusDays(2))
                .build());

        bookingDetailRepository.save(new BookingDetail(
                null,
                booking,
                "TOUR",
                testTour,
                null,
                testTour.getTitle(),
                testTour.getPrice(),
                1,
                1,
                testTour.getPrice()
        ));

        mockMvc.perform(delete("/api/v1/admin/partners/tours/" + testTour.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detail", containsString("Không thể xóa Tour vì đã phát sinh đơn đặt chỗ")));
    }

    @Test
    @DisplayName("GET /api/v1/admin/partners/hotels - Admin gets paged partner hotels")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testGetAdminHotels_Success() throws Exception {
        mockMvc.perform(get("/api/v1/admin/partners/hotels")
                        .param("status", "ACTIVE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].name", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/admin/partners/hotels - Admin creates hotel with valid location")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testCreateHotel_Success() throws Exception {
        HotelRequest request = new HotelRequest(
                "Ana Mandara Villas Dalat Resort & Spa",
                "Làng biệt thự Pháp cổ giữa rừng thông với dịch vụ 5 sao chuẩn quốc tế.",
                testLocation.getId(),
                "Lâm Đồng",
                "Đường Lê Lai, Phường 5, Đà Lạt",
                5,
                new BigDecimal("3200000.00"),
                "VND",
                "https://example.com/anamandara.jpg",
                "Hồ bơi nước ấm, La Cochinchine Spa, Nhà hàng Le Petit",
                "02633555888",
                "reservation@anamandara-resort.com",
                20,
                "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/admin/partners/hotels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Ana Mandara Villas Dalat Resort & Spa")))
                .andExpect(jsonPath("$.locationId", is(testLocation.getId().intValue())))
                .andExpect(jsonPath("$.province", is("Lâm Đồng")));
    }

    @Test
    @DisplayName("POST /api/v1/admin/partners/hotels - Returns 404 when locationId does not exist")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testCreateHotel_LocationNotFound() throws Exception {
        HotelRequest request = new HotelRequest(
                "Khách Sạn Không Tồn Tại",
                "Mô tả",
                999999L,
                "Lâm Đồng",
                "Địa chỉ",
                3,
                new BigDecimal("1000000.00"),
                "VND",
                null, null, null, null, 10, "ACTIVE"
        );

        mockMvc.perform(post("/api/v1/admin/partners/hotels")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.detail", containsString("Location not found with id: 999999")));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/partners/hotels/{id}/status - Admin updates hotel status to SUSPENDED")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testUpdateHotelStatus_Success() throws Exception {
        PartnerStatusUpdateRequest request = new PartnerStatusUpdateRequest("SUSPENDED", "Tạm đình chỉ do nâng cấp hệ thống phòng cháy");

        mockMvc.perform(put("/api/v1/admin/partners/hotels/" + testHotel.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testHotel.getId().intValue())))
                .andExpect(jsonPath("$.status", is("SUSPENDED")));
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/partners/hotels/{id} - Delete succeeds when no booking exists")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testDeleteHotel_Success() throws Exception {
        Hotel hotelToDelete = hotelRepository.save(Hotel.builder()
                .name("Khách Sạn Thử Nghiệm Xóa")
                .pricePerNight(new BigDecimal("500000.00"))
                .currency("VND")
                .stars(3)
                .availableRooms(5)
                .status("ACTIVE")
                .build());

        mockMvc.perform(delete("/api/v1/admin/partners/hotels/" + hotelToDelete.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/partners/hotels/{id} - Returns 400 Bad Request if booking exists")
    @WithMockUser(username = "admin", roles = "ADMIN")
    void testDeleteHotel_WithExistingBooking_BadRequest() throws Exception {
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("BK-HOTEL-TEST-" + System.currentTimeMillis())
                .user(testUser)
                .bookingType("HOTEL")
                .status("PENDING")
                .totalAmount(new BigDecimal("2800000.00"))
                .contactName("Khách Hàng Test")
                .contactEmail("partner_test_user@example.com")
                .contactPhone("0901234567")
                .startDate(LocalDate.now().plusDays(3))
                .build());

        bookingDetailRepository.save(new BookingDetail(
                null,
                booking,
                "HOTEL",
                null,
                testHotel,
                testHotel.getName(),
                testHotel.getPricePerNight(),
                1,
                1,
                testHotel.getPricePerNight()
        ));

        mockMvc.perform(delete("/api/v1/admin/partners/hotels/" + testHotel.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detail", containsString("Không thể xóa Khách sạn vì đã phát sinh đơn đặt chỗ")));
    }
}
