package com.travelai.backend.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.SessionService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** An administrator must be able to set a province, and older clients must not erase it. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogProvinceTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SessionService sessions;
    @Autowired ObjectMapper json;
    String admin;

    @BeforeEach void admin() {
        User user = new User();
        user.setEmail(UUID.randomUUID() + "@example.test"); user.setRole("ADMIN"); user.setStatus("active");
        user.setPassword("synthetic-fixture");
        user = users.saveAndFlush(user);
        admin = "Bearer " + sessions.login(user.getEmail(), "synthetic-fixture").get("token");
    }

    long create(String path, String body) throws Exception {
        String created = mvc.perform(post(path).header("Authorization", admin).contentType("application/json").content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(created).get("id").asLong();
    }

    @Test void placeProvinceCanBeSetAndOlderClientsKeepIt() throws Exception {
        long id = create("/api/places", "{\"name\":\"Synthetic place " + UUID.randomUUID() + "\"}");
        mvc.perform(put("/api/places/" + id).header("Authorization", admin).contentType("application/json")
                        .content("{\"name\":\"Synthetic renamed\",\"province\":\"Gia Lai\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.province").value("Gia Lai"));
        mvc.perform(put("/api/places/" + id).header("Authorization", admin).contentType("application/json")
                        .content("{\"name\":\"Synthetic renamed again\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.province").value("Gia Lai"));
    }

    @Test void tourProvinceCanBeSetAndOlderClientsKeepIt() throws Exception {
        long id = create("/api/tours", "{\"name\":\"Synthetic tour " + UUID.randomUUID() + "\",\"location\":\"Synthetic area\",\"province\":\"Gia Lai\"}");
        mvc.perform(put("/api/tours/" + id).header("Authorization", admin).contentType("application/json")
                        .content("{\"name\":\"Synthetic updated\",\"location\":\"Synthetic area\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.province").value("Gia Lai"));
    }
}
