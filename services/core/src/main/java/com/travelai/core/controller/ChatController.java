package com.travelai.core.controller;

import com.travelai.core.dto.request.ChatMessageRequest;
import com.travelai.core.dto.response.ChatMessageResponse;
import com.travelai.core.dto.response.ConversationSummaryResponse;
import com.travelai.core.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication) {
        ChatMessageResponse response = chatService.sendMessage(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/conversations/{partnerId}")
    public ResponseEntity<Page<ChatMessageResponse>> getConversationHistory(
            @PathVariable Long partnerId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        Page<ChatMessageResponse> history = chatService.getConversationHistory(authentication.getName(), partnerId, pageable);
        return ResponseEntity.ok(history);
    }

    @PutMapping("/conversations/{partnerId}/read")
    public ResponseEntity<Map<String, Object>> markConversationAsRead(
            @PathVariable Long partnerId,
            Authentication authentication) {
        int count = chatService.markConversationAsRead(authentication.getName(), partnerId);
        return ResponseEntity.ok(Map.of(
                "markedAsRead", true,
                "updatedCount", count
        ));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummaryResponse>> getUserConversations(
            Authentication authentication) {
        List<ConversationSummaryResponse> conversations = chatService.getUserConversations(authentication.getName());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadMessageCount(
            Authentication authentication) {
        long count = chatService.getUnreadMessageCount(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "unreadCount", count
        ));
    }
}
