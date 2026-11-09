package com.travelai.backend.community;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.SessionService;
import com.travelai.backend.security.SessionService.Actor;
import org.junit.jupiter.api.BeforeEach;
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
 * Post visibility and interaction policy (spec §5 Community).
 * RED-first regression: pending/rejected content must not leak via
 * feed, direct-id like/comment/share, or admin shape.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PostAccessPolicyIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SessionService sessions;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper json;

    Actor admin;
    Actor owner;
    Actor outsider;

    @BeforeEach void fixture() {
        admin = user("ADMIN");
        owner = user("USER");
        outsider = user("USER");
    }

    Actor user(String role) {
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

    long createPost(Actor author) throws Exception {
        String response = mvc.perform(post("/api/posts")
                        .header("Authorization", bearer(author))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("content", "Synthetic post"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("id").asLong();
    }

    void approve(long postId) throws Exception {
        mvc.perform(put("/api/posts/" + postId + "/approve").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test void feedOnlyShowsApprovedToOtherUsers() throws Exception {
        long pendingId = createPost(owner);
        long approvedId = createPost(owner);
        approve(approvedId);

        mvc.perform(get("/api/posts").header("Authorization", bearer(outsider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==%d)]", pendingId).doesNotExist())
                .andExpect(jsonPath("$[?(@.id==%d)]", approvedId).exists());
    }

    @Test void interactionsOnPendingPostAreForbiddenForNonOwner() throws Exception {
        long pendingId = createPost(owner);

        mvc.perform(post("/api/posts/" + pendingId + "/like")
                        .header("Authorization", bearer(outsider))
                        .contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/posts/" + pendingId + "/comments")
                        .header("Authorization", bearer(outsider))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("text", "x"))))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/posts/" + pendingId + "/share")
                        .header("Authorization", bearer(outsider))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("caption", "x"))))
                .andExpect(status().isForbidden());
    }

    @Test void ownerSeesOwnPendingAndAdminAllUsesMappedShape() throws Exception {
        long pendingId = createPost(owner);

        mvc.perform(get("/api/posts/user/" + owner.id()).header("Authorization", bearer(owner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(pendingId));

        mvc.perform(get("/api/posts/user/" + owner.id()).header("Authorization", bearer(outsider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==%d)]", pendingId).doesNotExist());

        mvc.perform(get("/api/posts/admin/all").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==%d)]", pendingId).exists())
                .andExpect(jsonPath("$[?(@.id==%d)].likesCount", pendingId).exists());
    }
}
