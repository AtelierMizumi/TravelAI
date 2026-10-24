package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.BookingStatusUpdateRequest;
import com.travelai.core.dto.request.PaymentReconcileRequest;
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
class AdminBookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long testBookingId;
    private Long testPaymentId;

    @BeforeEach
    void setUp() {
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ADMIN)));

        User traveler = userRepository.findByUsername("audit_traveler").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("audit_traveler")
                        .email("audit_traveler@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Trần Kiểm Toán")
                        .role(userRole)
                        .enabled(true)
                        .build())
        );

        userRepository.findByUsername("admin").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin_audit@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Admin Quản Trị")
                        .role(adminRole)
                        .enabled(true)
                        .build())
        );

        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("BK-AUDIT-" + System.currentTimeMillis())
                .user(traveler)
                .bookingType("TOUR")
                .status("PENDING")
                .totalAmount(new BigDecimal("2500000.00"))
                .contactName("Trần Kiểm Toán")
                .contactEmail("audit_traveler@example.com")
                .contactPhone("0912345678")
                .startDate(LocalDate.now().plusDays(5))
                .build());
        testBookingId = booking.getId();

        Payment payment = paymentRepository.save(Payment.builder()
                .booking(booking)
                .transactionCode("TXN-AUDIT-" + System.currentTimeMillis())
                .paymentMethod("VNPAY")
                .amount(new BigDecimal("2500000.00"))
                .status("SUCCESS")
                .reconciliationStatus("UNRECONCILED")
                .build());
        testPaymentId = payment.getId();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/bookings by ADMIN should return paged bookings list")
    void testGetBookingsForAudit_AdminSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/bookings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "audit_traveler", roles = {"USER"})
    @DisplayName("GET /api/v1/admin/bookings by regular USER should return 403 Forbidden")
    void testGetBookingsForAudit_ForbiddenForUser() throws Exception {
        mockMvc.perform(get("/api/v1/admin/bookings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/admin/bookings unauthenticated should return 401 Unauthorized")
    void testGetBookingsForAudit_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/bookings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/bookings/{id}/status by ADMIN should update status to CONFIRMED")
    void testUpdateBookingStatus_AdminSuccess() throws Exception {
        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest("CONFIRMED", "Đã xác nhận với đối tác lữ hành");

        mockMvc.perform(put("/api/v1/admin/bookings/{id}/status", testBookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testBookingId.intValue())))
                .andExpect(jsonPath("$.status", is("CONFIRMED")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/bookings/{id}/status with invalid status should return 400 Bad Request")
    void testUpdateBookingStatus_InvalidStatus() throws Exception {
        BookingStatusUpdateRequest request = new BookingStatusUpdateRequest("INVALID_STATUS", "Note");

        mockMvc.perform(put("/api/v1/admin/bookings/{id}/status", testBookingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detail", containsString("Trạng thái đơn không hợp lệ")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/bookings/stats by ADMIN should return operational metrics")
    void testGetAuditStats_AdminSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/bookings/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBookings", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalRevenue", notNullValue()))
                .andExpect(jsonPath("$.reconciliationRate", notNullValue()))
                .andExpect(jsonPath("$.formattedTotalRevenue", notNullValue()));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/bookings/reconciliation by ADMIN should return paged payments")
    void testGetPaymentsForReconciliation_AdminSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/bookings/reconciliation")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/bookings/reconciliation/{paymentId} should reconcile payment")
    void testReconcilePayment_AdminSuccess() throws Exception {
        PaymentReconcileRequest request = new PaymentReconcileRequest(
                "RECONCILED",
                "VNPAY-REF-998877",
                "Đã khớp sao kê ngân hàng VCB ngày 24/10/2026"
        );

        mockMvc.perform(put("/api/v1/admin/bookings/reconciliation/{paymentId}", testPaymentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testPaymentId.intValue())))
                .andExpect(jsonPath("$.reconciliationStatus", is("RECONCILED")))
                .andExpect(jsonPath("$.transactionRef", is("VNPAY-REF-998877")))
                .andExpect(jsonPath("$.auditNotes", is("Đã khớp sao kê ngân hàng VCB ngày 24/10/2026")));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("PUT /api/v1/admin/bookings/reconciliation/{paymentId} not found should return 404")
    void testReconcilePayment_NotFound() throws Exception {
        PaymentReconcileRequest request = new PaymentReconcileRequest("RECONCILED", null, null);

        mockMvc.perform(put("/api/v1/admin/bookings/reconciliation/{paymentId}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }
}
