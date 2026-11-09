package com.travelai.backend.admin;

import com.travelai.backend.entity.SystemSettings;
import com.travelai.backend.entity.User;
import com.travelai.backend.repository.SystemSettingsRepository;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.SessionService;
import com.travelai.backend.security.SessionService.Actor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Maintenance gate (spec §5 Settings/maintenance, Task 5).
 * Only POST /api/booking/reviews (new canonical purchase) is blocked;
 * login/read/pay/cancel stay available.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MaintenancePolicyIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SessionService sessions;
    @Autowired SystemSettingsRepository settings;

    Actor makeUser(String role) {
        User user = new User();
        user.setEmail(UUID.randomUUID() + "@example.test");
        user.setRole(role);
        user.setStatus("active");
        user.setPassword("synthetic-fixture");
        return new Actor(users.saveAndFlush(user).getId(), role);
    }

    String bearer(Actor actor) {
        String email = users.findById(actor.id()).orElseThrow().getEmail();
        return "Bearer " + sessions.login(email, "synthetic-fixture").get("token");
    }

    void setMaintenance(boolean enabled) {
        SystemSettings s = settings.findById(1L).orElseGet(() ->
                settings.saveAndFlush(SystemSettings.builder().id(1L).build()));
        s.setMaintenanceMode(enabled);
        if (s.getSiteName() == null) s.setSiteName("TravelAI");
        if (s.getAdminEmail() == null) s.setAdminEmail("admin@travelai.example");
        if (s.getEmailNotify() == null) s.setEmailNotify(true);
        if (s.getSystemNotify() == null) s.setSystemNotify(true);
        settings.saveAndFlush(s);
    }

    @Test void maintenanceBlocksNewReviewButAllowsReadAndAuth() throws Exception {
        setMaintenance(true);
        Actor traveler = makeUser("USER");
        String token = bearer(traveler);

        mvc.perform(post("/api/booking/reviews")
                        .header("Authorization", token)
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType("application/json").content("{}"))
                .andExpect(status().isServiceUnavailable());

        mvc.perform(get("/api/booking/offers").header("Authorization", token))
                .andExpect(status().isOk());

        mvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"nobody-maint@example.test\",\"password\":\"x\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test void maintenanceOffAllowsReviewPathToReachValidation() throws Exception {
        setMaintenance(false);
        Actor traveler = makeUser("USER");

        int status = mvc.perform(post("/api/booking/reviews")
                        .header("Authorization", bearer(traveler))
                        .header("Idempotency-Key", UUID.randomUUID().toString())
                        .contentType("application/json").content("{}"))
                .andReturn().getResponse().getStatus();
        org.junit.jupiter.api.Assertions.assertNotEquals(503, status);
    }
}
