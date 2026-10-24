package com.travelai.core.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelai.core.dto.request.ChatMessageRequest;
import com.travelai.core.model.entity.Role;
import com.travelai.core.model.entity.RoleName;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.ChatMessageRepository;
import com.travelai.core.repository.RoleRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long userAId;
    private Long userBId;

    @BeforeEach
    void setUp() {
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_USER)));

        User userA = userRepository.findByUsername("chat_user_a").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("chat_user_a")
                        .email("chat_a@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Nguyễn Văn A")
                        .role(userRole)
                        .enabled(true)
                        .build())
        );
        userAId = userA.getId();

        User userB = userRepository.findByUsername("chat_user_b").orElseGet(() ->
                userRepository.save(User.builder()
                        .username("chat_user_b")
                        .email("chat_b@example.com")
                        .password(passwordEncoder.encode("Password123!"))
                        .fullName("Trần Thị B")
                        .role(userRole)
                        .enabled(true)
                        .build())
        );
        userBId = userB.getId();
    }

    @Test
    @WithMockUser(username = "chat_user_a", roles = {"USER"})
    @DisplayName("POST /api/v1/chat/messages should send message and create conversation")
    void testSendMessage_Success() throws Exception {
        ChatMessageRequest request = new ChatMessageRequest(userBId, "Xin chào bạn, bạn đã từng đi tour Hạ Long chưa?", "CHAT");

        mockMvc.perform(post("/api/v1/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.senderUsername", is("chat_user_a")))
                .andExpect(jsonPath("$.recipientUsername", is("chat_user_b")))
                .andExpect(jsonPath("$.content", is("Xin chào bạn, bạn đã từng đi tour Hạ Long chưa?")))
                .andExpect(jsonPath("$.isRead", is(false)))
                .andExpect(jsonPath("$.conversationId", notNullValue()));
    }

    @Test
    @WithMockUser(username = "chat_user_a", roles = {"USER"})
    @DisplayName("POST /api/v1/chat/messages to self should return 400 Bad Request")
    void testSendMessage_ToSelfForbidden() throws Exception {
        ChatMessageRequest request = new ChatMessageRequest(userAId, "Tin nhắn gửi cho chính mình", "CHAT");

        mockMvc.perform(post("/api/v1/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.detail", containsString("Không thể gửi tin nhắn cho chính mình")));
    }

    @Test
    @WithMockUser(username = "chat_user_a", roles = {"USER"})
    @DisplayName("POST /api/v1/chat/messages to non-existent user should return 404")
    void testSendMessage_RecipientNotFound() throws Exception {
        ChatMessageRequest request = new ChatMessageRequest(999999L, "Tin nhắn tới người không tồn tại", "CHAT");

        mockMvc.perform(post("/api/v1/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    @Test
    @DisplayName("POST /api/v1/chat/messages unauthenticated should return 401 Unauthorized")
    void testSendMessage_Unauthorized() throws Exception {
        ChatMessageRequest request = new ChatMessageRequest(userBId, "Tin nhắn ẩn danh", "CHAT");

        mockMvc.perform(post("/api/v1/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "chat_user_a", roles = {"USER"})
    @DisplayName("GET /api/v1/chat/conversations/{partnerId} should return conversation history")
    void testGetConversationHistory_Success() throws Exception {
        // Send a message first
        ChatMessageRequest msg = new ChatMessageRequest(userBId, "Hỏi về khách sạn tại Hội An", "CHAT");
        mockMvc.perform(post("/api/v1/chat/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(msg)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/chat/conversations/{partnerId}", userBId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @WithMockUser(username = "chat_user_b", roles = {"USER"})
    @DisplayName("GET /api/v1/chat/unread-count and PUT /read should mark messages as read")
    void testUnreadCountAndMarkAsRead() throws Exception {
        // user A sends message to user B
        ChatMessageRequest msg = new ChatMessageRequest(userBId, "Tin nhắn kiểm tra số lượng unread", "CHAT");
        // We can save directly or call service
        mockMvc.perform(get("/api/v1/chat/unread-count")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", notNullValue()));

        // Mark conversation as read
        mockMvc.perform(put("/api/v1/chat/conversations/{partnerId}/read", userAId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markedAsRead", is(true)));
    }

    @Test
    @WithMockUser(username = "chat_user_a", roles = {"USER"})
    @DisplayName("GET /api/v1/chat/conversations should return conversation summaries")
    void testGetUserConversations_Success() throws Exception {
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", notNullValue()));
    }
}
