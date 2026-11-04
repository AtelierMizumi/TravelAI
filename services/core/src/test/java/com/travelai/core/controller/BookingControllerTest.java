package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.BookingCreateRequest;
import com.travelai.core.dto.request.PaymentProcessRequest;
import com.travelai.core.model.entity.*;
import com.travelai.core.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long testTourId;
    private Long testHotelId;
    private Long travelerUserId;

    @BeforeEach
    void setUp() {
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ADMIN)));

        User traveler = userRepository.findByUsername("traveler_booking").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("traveler_booking")
                        .email("traveler_booking@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Nguyễn Du Khách")
                        .role(userRole)
                        .enabled(true)
                        .build())
        );
        travelerUserId = traveler.getId();

        userRepository.findByUsername("other_traveler").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("other_traveler")
                        .email("other_traveler@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Lê Khách Khác")
                        .role(userRole)
                        .enabled(true)
                        .build())
        );

        userRepository.findByUsername("admin").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin_booking@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Admin Quản Trị")
                        .role(adminRole)
                        .enabled(true)
                        .build())
        );

        Location loc = locationRepository.findByNameIgnoreCase("Đà Nẵng Biển Xanh").orElseGet(() ->
                locationRepository.save(Location.builder()
                        .name("Đà Nẵng Biển Xanh")
                        .province("Đà Nẵng")
                        .description("Thành phố biển đáng sống bậc nhất Việt Nam.")
                        .category("Biển đảo")
                        .latitude(16.0544)
                        .longitude(108.2022)
                        .build())
        );

        Tour tour = tourRepository.save(Tour.builder()
                .title("Tour Bà Nà Hills & Ngũ Hành Sơn 1 Ngày")
                .description("Tham quan Cầu Vàng và động Huyền Không.")
                .location(loc)
                .province("Đà Nẵng")
                .duration("1 ngày")
                .price(new BigDecimal("950000.00"))
                .currency("VND")
                .availableSlots(20)
                .status("ACTIVE")
                .build());
        testTourId = tour.getId();

        Hotel hotel = hotelRepository.save(Hotel.builder()
                .name("InterContinental Danang Sun Peninsula")
                .description("Khu nghỉ dưỡng sang trọng bậc nhất bán đảo Sơn Trà.")
                .location(loc)
                .province("Đà Nẵng")
                .address("Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng")
                .stars(5)
                .pricePerNight(new BigDecimal("5000000.00"))
                .currency("VND")
                .availableRooms(10)
                .status("ACTIVE")
                .build());
        testHotelId = hotel.getId();
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("POST /api/v1/bookings with TOUR should create booking and calculate total amount")
    void testCreateBooking_TourSuccess() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest(
                "TOUR",
                testTourId,
                null,
                LocalDate.now().plusDays(7),
                null,
                2,
                1,
                "Nguyễn Du Khách",
                "traveler_booking@example.com",
                "0987654321",
                "Ghế ngồi cạnh cửa sổ",
                "MOCK_GATEWAY"
        );

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.bookingCode", startsWith("BK-")))
                .andExpect(jsonPath("$.bookingType", is("TOUR")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.totalAmount", is(1900000.0)))
                .andExpect(jsonPath("$.formattedTotalAmount", is("1.900.000 đ")))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].unitPrice", is(950000.0)))
                .andExpect(jsonPath("$.items[0].quantity", is(2)))
                .andExpect(jsonPath("$.items[0].subtotal", is(1900000.0)))
                .andExpect(jsonPath("$.payment", notNullValue()))
                .andExpect(jsonPath("$.payment.status", is("PENDING")));
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("POST /api/v1/bookings with HOTEL should calculate nights and total amount")
    void testCreateBooking_HotelSuccess() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest(
                "HOTEL",
                null,
                testHotelId,
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(13),
                1,
                3,
                "Nguyễn Du Khách",
                "traveler_booking@example.com",
                "0987654321",
                "Phòng tầng cao không hút thuốc",
                "VNPAY"
        );

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.bookingType", is("HOTEL")))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.totalAmount", is(15000000.0)))
                .andExpect(jsonPath("$.formattedTotalAmount", is("15.000.000 đ")))
                .andExpect(jsonPath("$.items[0].numberOfNights", is(3)))
                .andExpect(jsonPath("$.items[0].subtotal", is(15000000.0)));
    }

    @Test
    @DisplayName("POST /api/v1/bookings unauthenticated should return 401 Unauthorized")
    void testCreateBooking_Unauthorized() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest();
        request.setBookingType("TOUR");
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setContactName("Khách Vãng Lai");
        request.setContactEmail("guest@example.com");
        request.setContactPhone("0912345678");

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("POST /api/v1/bookings with invalid input should return 400 Bad Request")
    void testCreateBooking_ValidationError() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest();
        // Missing required fields: bookingType, startDate, contactName, contactEmail, contactPhone

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.errors", notNullValue()));
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("POST /api/v1/bookings with non-existent tour should return 404")
    void testCreateBooking_TourNotFound() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest(
                "TOUR",
                999999L,
                null,
                LocalDate.now().plusDays(7),
                null,
                1,
                1,
                "Nguyễn Du Khách",
                "traveler_booking@example.com",
                "0987654321",
                null,
                "MOCK_GATEWAY"
        );

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.detail", containsString("Tour not found with id: 999999")));
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("GET /api/v1/bookings/my-bookings should return traveler's bookings")
    void testGetMyBookings_Success() throws Exception {
        // Create booking first
        BookingCreateRequest request = new BookingCreateRequest(
                "TOUR",
                testTourId,
                null,
                LocalDate.now().plusDays(3),
                null,
                1,
                1,
                "Nguyễn Du Khách",
                "traveler_booking@example.com",
                "0987654321",
                null,
                "MOCK_GATEWAY"
        );

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/bookings/my-bookings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].username", is("traveler_booking")));
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("GET /api/v1/bookings/{id} should return details to booking owner")
    void testGetBookingById_OwnerSuccess() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest(
                "TOUR",
                testTourId,
                null,
                LocalDate.now().plusDays(4),
                null,
                1,
                1,
                "Nguyễn Du Khách",
                "traveler_booking@example.com",
                "0987654321",
                null,
                "MOCK_GATEWAY"
        );

        String createRes = mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Number bookingId = objectMapper.readTree(createRes).get("id").numberValue();

        mockMvc.perform(get("/api/v1/bookings/{id}", bookingId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(bookingId.intValue())))
                .andExpect(jsonPath("$.bookingCode", startsWith("BK-")));
    }

    @Test
    @WithMockUser(username = "other_traveler", roles = {"USER"})
    @DisplayName("GET /api/v1/bookings/{id} by other user should return 403 Forbidden")
    void testGetBookingById_ForbiddenForOtherUser() throws Exception {
        // Create booking as traveler_booking
        User traveler = userRepository.findByUsername("traveler_booking").orElseThrow();
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("BK-FORBIDDEN-TEST")
                .user(traveler)
                .bookingType("TOUR")
                .status("PENDING")
                .totalAmount(new BigDecimal("500000.00"))
                .contactName("Nguyễn Du Khách")
                .contactEmail("traveler_booking@example.com")
                .contactPhone("0987654321")
                .startDate(LocalDate.now().plusDays(2))
                .build());

        mockMvc.perform(get("/api/v1/bookings/{id}", booking.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/bookings/{id} by ADMIN should succeed even if not owner")
    void testGetBookingById_AdminSuccess() throws Exception {
        User traveler = userRepository.findByUsername("traveler_booking").orElseThrow();
        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("BK-ADMIN-ACCESS-TEST")
                .user(traveler)
                .bookingType("TOUR")
                .status("PENDING")
                .totalAmount(new BigDecimal("500000.00"))
                .contactName("Nguyễn Du Khách")
                .contactEmail("traveler_booking@example.com")
                .contactPhone("0987654321")
                .startDate(LocalDate.now().plusDays(2))
                .build());

        mockMvc.perform(get("/api/v1/bookings/{id}", booking.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(booking.getId().intValue())));
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("POST /api/v1/bookings/{id}/pay should process payment and issue voucher")
    void testProcessPayment_Success() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest(
                "TOUR",
                testTourId,
                null,
                LocalDate.now().plusDays(6),
                null,
                1,
                1,
                "Nguyễn Du Khách",
                "traveler_booking@example.com",
                "0987654321",
                null,
                "VNPAY"
        );

        String createRes = mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Number bookingId = objectMapper.readTree(createRes).get("id").numberValue();

        PaymentProcessRequest payReq = new PaymentProcessRequest("VNPAY", true);

        mockMvc.perform(post("/api/v1/bookings/{id}/pay", bookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PAID")))
                .andExpect(jsonPath("$.voucherCode", startsWith("VCH-")))
                .andExpect(jsonPath("$.payment.status", is("SUCCESS")))
                .andExpect(jsonPath("$.payment.paidAt", notNullValue()));
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("PUT /api/v1/bookings/{id}/cancel should change status to CANCELLED")
    void testCancelBooking_Success() throws Exception {
        BookingCreateRequest request = new BookingCreateRequest(
                "TOUR",
                testTourId,
                null,
                LocalDate.now().plusDays(8),
                null,
                1,
                1,
                "Nguyễn Du Khách",
                "traveler_booking@example.com",
                "0987654321",
                null,
                "MOCK_GATEWAY"
        );

        String createRes = mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Number bookingId = objectMapper.readTree(createRes).get("id").numberValue();

        mockMvc.perform(put("/api/v1/bookings/{id}/cancel", bookingId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CANCELLED")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/bookings/admin/all by ADMIN should return all bookings")
    void testAdminGetAllBookings_Success() throws Exception {
        mockMvc.perform(get("/api/v1/bookings/admin/all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()));
    }

    @Test
    @WithMockUser(username = "traveler_booking", roles = {"USER"})
    @DisplayName("GET /api/v1/bookings/admin/all by regular USER should return 403 Forbidden")
    void testAdminGetAllBookings_ForbiddenForUser() throws Exception {
        mockMvc.perform(get("/api/v1/bookings/admin/all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
