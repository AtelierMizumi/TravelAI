package com.travelai.backend.controller;

import com.travelai.backend.repository.ChatMessageRepository;
import com.travelai.backend.security.ApiSecurity;
import com.travelai.backend.service.ChatDeliveryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageRepository chatRepository;
    private final ChatDeliveryService delivery;

    public ChatController(ChatMessageRepository chatRepository, ChatDeliveryService delivery) {
        this.delivery = delivery;
        this.chatRepository = chatRepository;
    }

    public record SendRequest(long receiverId, String content, String clientMessageId) {}
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestBody SendRequest request) {
        return ResponseEntity.ok(delivery.send(ApiSecurity.currentActor(), request.receiverId(), request.content(), request.clientMessageId()));
    }
    private void requireParticipant(long userId) {
        if (ApiSecurity.currentActor().id() != userId)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Private conversation access denied");
    }
    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(
            @RequestParam Long user1,
            @RequestParam Long user2
    ) {
        requireParticipant(user1);
        return ResponseEntity.ok(
                chatRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
                        user1,
                        user2,
                        user1,
                        user2
                ).stream().map(delivery::view).toList()
        );
    }

    @GetMapping("/inbox/{userId}")
    public ResponseEntity<?> getInbox(@PathVariable Long userId) {
        requireParticipant(userId);
        return ResponseEntity.ok(
                chatRepository.findBySenderIdOrReceiverIdOrderByCreatedAtDesc(userId, userId).stream().map(delivery::inboxView).toList()
        );
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<?> unreadCount(@PathVariable Long userId) {
        requireParticipant(userId);
        return ResponseEntity.ok(
                Map.of(
                        "count",
                        chatRepository.countByReceiverIdAndIsReadFalse(userId)
                )
        );
    }

    @PutMapping("/read")
    public ResponseEntity<?> markConversationRead(
            @RequestParam Long currentUserId,
            @RequestParam Long otherUserId
    ) {
        requireParticipant(currentUserId);
        var messages =
                chatRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
                        otherUserId,
                        currentUserId,
                        currentUserId,
                        otherUserId
                );

        messages.forEach(msg -> {
            if (msg.getReceiverId().equals(currentUserId)) {
                msg.setIsRead(true);
            }
        });

        chatRepository.saveAll(messages);

        return ResponseEntity.ok(Map.of("message", "Read successfully"));
    }
}