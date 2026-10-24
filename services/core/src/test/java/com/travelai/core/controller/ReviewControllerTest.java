package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.ReviewRequest;
import com.travelai.core.model.entity.Location;
import com.travelai.core.model.entity.Review;
import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
import com.travelai.core.model.entity.Tour;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.LocationRepository;
import com.travelai.core.repository.ReviewRepository;
import com.travelai.core.repository.RoleRepository;
import com.travelai.core.repository.TourRepository;
import com.travelai.core.repository.UserRepository;
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
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private User otherUser;
    private User adminUser;
    private Location testLocation;
    private Tour testTour;
    private Review sampleReview;

    @BeforeEach
    void setUp() {
        Role roleUser = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));
        Role roleAdmin = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_ADMIN)));

        testUser = userRepository.findByUsername("reviewer_duc").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("reviewer_duc")
                        .email("reviewer_duc@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Đức Reviewer")
                        .role(roleUser)
                        .enabled(true)
                        .build())
        );

        otherUser = userRepository.findByUsername("other_traveler").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("other_traveler")
                        .email("other_traveler@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Ngọc Traveler")
                        .role(roleUser)
                        .enabled(true)
                        .build())
        );

        adminUser = userRepository.findByUsername("admin_duc").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("admin_duc")
                        .email("admin_duc@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Admin Đức")
                        .role(roleAdmin)
                        .enabled(true)
                        .build())
        );

        testLocation = locationRepository.findByNameIgnoreCase("Hạ Long Xanh").orElseGet(() ->
                locationRepository.save(Location.builder()
                        .name("Hạ Long Xanh")
                        .province("Quảng Ninh")
                        .description("Vịnh biển di sản tuyệt đẹp.")
                        .category("Di sản")
                        .build())
        );

        testTour = tourRepository.save(Tour.builder()
                .title("Tour Trải Nghiệm Vịnh Xanh 1 Ngày " + System.currentTimeMillis())
                .duration("1 ngày")
                .price(new BigDecimal("990000.00"))
                .location(testLocation)
                .province("Quảng Ninh")
                .status("ACTIVE")
                .build());

        // Ensure clean review state for test user & location
        reviewRepository.findByUserIdAndLocationId(testUser.getId(), testLocation.getId())
                .ifPresent(reviewRepository::delete);

        sampleReview = reviewRepository.save(Review.builder()
                .user(testUser)
                .location(testLocation)
                .rating(5)
                .comment("Địa danh tuyệt vời, cảnh sắc thiên nhiên hùng vĩ đáng để trải nghiệm!")
                .images("https://images.unsplash.com/photo-1,https://images.unsplash.com/photo-2")
                .build());
    }

    @Test
    @DisplayName("GET /api/v1/locations/{id}/reviews should return paged reviews publicly")
    void testGetReviewsByLocation_PublicSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/locations/{locationId}/reviews", testLocation.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].username", is("reviewer_duc")))
                .andExpect(jsonPath("$.content[0].rating", is(5)))
                .andExpect(jsonPath("$.content[0].images", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/v1/reviews/{id} should return single review details")
    void testGetReviewById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/reviews/{id}", sampleReview.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(sampleReview.getId().intValue())))
                .andExpect(jsonPath("$.rating", is(5)))
                .andExpect(jsonPath("$.comment", containsString("Địa danh tuyệt vời")));
    }

    @Test
    @DisplayName("GET /api/v1/reviews/{id} should return 404 for nonexistent review")
    void testGetReviewById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/reviews/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @WithMockUser(username = "other_traveler", roles = {"USER"})
    @DisplayName("POST /api/v1/locations/{id}/reviews by authenticated user should create review and update location aggregate rating")
    void testCreateLocationReview_AuthenticatedSuccess() throws Exception {
        ReviewRequest request = new ReviewRequest(
                testLocation.getId(),
                null,
                4,
                "Chuyến đi rất thú vị, cảnh quan đẹp tuyệt vời!",
                List.of("https://images.unsplash.com/photo-sample")
        );

        mockMvc.perform(post("/api/v1/locations/{locationId}/reviews", testLocation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.username", is("other_traveler")))
                .andExpect(jsonPath("$.rating", is(4)))
                .andExpect(jsonPath("$.locationId", is(testLocation.getId().intValue())));
    }

    @Test
    @WithMockUser(username = "reviewer_duc", roles = {"USER"})
    @DisplayName("POST /api/v1/locations/{id}/reviews duplicate review by same user should return 400 Bad Request")
    void testCreateLocationReview_DuplicateRejection() throws Exception {
        ReviewRequest request = new ReviewRequest(
                testLocation.getId(),
                null,
                5,
                "Đánh giá trùng lặp không được chấp nhận.",
                null
        );

        mockMvc.perform(post("/api/v1/locations/{locationId}/reviews", testLocation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detail", containsString("Bạn đã đánh giá địa danh này rồi")));
    }

    @Test
    @DisplayName("POST /api/v1/locations/{id}/reviews unauthenticated should return 401 Unauthorized")
    void testCreateReview_Unauthorized() throws Exception {
        ReviewRequest request = new ReviewRequest(
                testLocation.getId(),
                null,
                5,
                "Chưa đăng nhập không được review.",
                null
        );

        mockMvc.perform(post("/api/v1/locations/{locationId}/reviews", testLocation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "other_traveler", roles = {"USER"})
    @DisplayName("POST review with invalid rating should return 400 Bad Request")
    void testCreateReview_InvalidRating() throws Exception {
        ReviewRequest request = new ReviewRequest(
                testLocation.getId(),
                null,
                6, // Invalid: exceeds max 5
                "Điểm rating vượt quá thang điểm 5 sao",
                null
        );

        mockMvc.perform(post("/api/v1/locations/{locationId}/reviews", testLocation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "reviewer_duc", roles = {"USER"})
    @DisplayName("PUT /api/v1/reviews/{id} by author should successfully update review")
    void testUpdateReview_AuthorSuccess() throws Exception {
        ReviewRequest request = new ReviewRequest(
                testLocation.getId(),
                null,
                4,
                "Đã cập nhật lại nội dung review sau khi ghé thăm lần 2.",
                List.of("https://images.unsplash.com/photo-updated")
        );

        mockMvc.perform(put("/api/v1/reviews/{id}", sampleReview.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating", is(4)))
                .andExpect(jsonPath("$.comment", containsString("sau khi ghé thăm lần 2")));
    }

    @Test
    @WithMockUser(username = "other_traveler", roles = {"USER"})
    @DisplayName("PUT /api/v1/reviews/{id} by non-author should return 403 Forbidden")
    void testUpdateReview_ForbiddenOtherUser() throws Exception {
        ReviewRequest request = new ReviewRequest(
                testLocation.getId(),
                null,
                3,
                "Cố tình sửa review của người khác.",
                null
        );

        mockMvc.perform(put("/api/v1/reviews/{id}", sampleReview.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "reviewer_duc", roles = {"USER"})
    @DisplayName("DELETE /api/v1/reviews/{id} by author should return 204 No Content")
    void testDeleteReview_AuthorSuccess() throws Exception {
        mockMvc.perform(delete("/api/v1/reviews/{id}", sampleReview.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/reviews/{id}", sampleReview.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin_duc", roles = {"ADMIN"})
    @DisplayName("DELETE /api/v1/reviews/{id} by ADMIN should delete any review and return 204 No Content")
    void testDeleteReview_AdminSuccess() throws Exception {
        mockMvc.perform(delete("/api/v1/reviews/{id}", sampleReview.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/reviews/{id}", sampleReview.getId()))
                .andExpect(status().isNotFound());
    }
}
