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

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * System settings DTO split + validation (spec §5 Settings/maintenance, Task 4).
 * Ruling: maintenanceMode stays public (mobile _layout.txt polls it for the
 * maintenance banner); internal notification flags are admin-only.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SystemSettingsIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SessionService sessions;
    @Autowired SystemSettingsRepository settings;

    Actor admin;
    Actor user;

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

    @Test void publicSettingsHideInternalNotificationFlags() throws Exception {
        SystemSettings settings = this.settings.findById(1L).orElseGet(() ->
                this.settings.saveAndFlush(SystemSettings.builder()
                        .id(1L)
                        .build()));
        settings.setSiteName("TravelAI");
        settings.setAdminEmail("admin@travelai.example");
        settings.setEmailNotify(true);
        settings.setSystemNotify(true);
        settings.setMaintenanceMode(false);
        this.settings.saveAndFlush(settings);

        mvc.perform(get("/api/system-settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.siteName").exists())
                .andExpect(jsonPath("$.maintenanceMode").exists())
                .andExpect(jsonPath("$.emailNotify").doesNotExist())
                .andExpect(jsonPath("$.systemNotify").doesNotExist());
    }

    @Test void updateSettingsRequiresAdminAndValidatesInput() throws Exception {
        admin = makeUser("ADMIN");
        user = makeUser("USER");
        String adminToken = bearer(admin);
        String userToken = bearer(user);

        mvc.perform(put("/api/system-settings")
                        .header("Authorization", userToken)
                        .contentType("application/json")
                        .content("{\"siteName\":\"X\",\"adminEmail\":\"a@b.com\",\"emailNotify\":true,\"systemNotify\":true,\"maintenanceMode\":false}"))
                .andExpect(status().isForbidden());

        mvc.perform(put("/api/system-settings")
                        .header("Authorization", adminToken)
                        .contentType("application/json")
                        .content("{\"siteName\":null,\"adminEmail\":null}"))
                .andExpect(status().isBadRequest());

        mvc.perform(put("/api/system-settings")
                        .header("Authorization", adminToken)
                        .contentType("application/json")
                        .content("{\"siteName\":\"TravelAI Updated\",\"adminEmail\":\"admin@travelai.example\",\"emailNotify\":false,\"systemNotify\":true,\"maintenanceMode\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.siteName").value("TravelAI Updated"))
                .andExpect(jsonPath("$.maintenanceMode").value(true));
    }

    @Test void adminSettingsEndpointRequiresAdmin() throws Exception {
        admin = makeUser("ADMIN");
        user = makeUser("USER");

        mvc.perform(get("/api/admin/system-settings").header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());

        mvc.perform(get("/api/admin/system-settings").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailNotify").exists())
                .andExpect(jsonPath("$.systemNotify").exists());
    }
}
