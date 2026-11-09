package com.travelai.backend.community;

import com.travelai.backend.entity.Post;
import com.travelai.backend.entity.PostLike;
import com.travelai.backend.entity.User;
import com.travelai.backend.repository.PostLikeRepository;
import com.travelai.backend.repository.PostRepository;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.SessionService;
import com.travelai.backend.security.SessionService.Actor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Like uniqueness/social leak regression (spec §5 Community, Task 3).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PostLikeUniquenessTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired SessionService sessions;
    @Autowired PostLikeRepository likes;
    @Autowired PostRepository posts;
    @Autowired com.fasterxml.jackson.databind.ObjectMapper json;

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

    Post savePost(Long authorId, String status, Long originalPostId) {
        return posts.saveAndFlush(Post.builder()
                .authorId(authorId)
                .authorName("A")
                .authorAvatar("")
                .content("Synthetic post")
                .image("")
                .shareCount(0)
                .originalPostId(originalPostId)
                .status(status)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Test void duplicateLikeInsertIsRejectedByUniqueConstraint() {
        Post post = savePost(user("USER").id(), "APPROVED", null);
        Long userId = user("USER").id();

        likes.saveAndFlush(PostLike.builder().postId(post.getId()).userId(userId).build());
        assertThrows(DataIntegrityViolationException.class, () ->
                likes.saveAndFlush(PostLike.builder().postId(post.getId()).userId(userId).build()));
    }

    @Test void duplicateLikeViaApiStaysIdempotent() throws Exception {
        Actor liker = user("USER");
        String token = bearer(liker);
        long postId = savePost(user("USER").id(), "APPROVED", null).getId();

        mvc.perform(post("/api/posts/" + postId + "/like")
                        .header("Authorization", token)
                        .contentType("application/json").content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likesCount").value(1));

        assertEquals(1, likes.countByPostId(postId));
    }

    @Test void sharedFeedHidesPendingOriginalPost() throws Exception {
        Actor author = user("USER");
        Actor outsider = user("USER");
        Post original = savePost(author.id(), "PENDING", null);
        savePost(author.id(), "APPROVED", original.getId());

        mvc.perform(get("/api/posts").header("Authorization", bearer(outsider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.originalPost!=null)]").doesNotExist());
    }
}
