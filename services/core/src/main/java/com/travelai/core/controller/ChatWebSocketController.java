package com.travelai.core.controller;

import com.travelai.core.dto.request.ChatMessageRequest;
import com.travelai.core.dto.response.ChatMessageResponse;
import com.travelai.core.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;

    public ChatWebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.send")
    public ChatMessageResponse handleChatMessage(@Payload ChatMessageRequest request, Principal principal) {
        String username = principal != null ? principal.getName() : "anonymous";
        return chatService.sendMessage(username, request);
    }
}
