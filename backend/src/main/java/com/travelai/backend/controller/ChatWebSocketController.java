package com.travelai.backend.controller;

import com.travelai.backend.security.SessionService;
import com.travelai.backend.service.ChatDeliveryService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import java.security.Principal;

@Controller
public class ChatWebSocketController {
    private final ChatDeliveryService delivery;
    public ChatWebSocketController(ChatDeliveryService delivery) { this.delivery = delivery; }

    @MessageMapping("/chat.send")
    public ChatDeliveryService.ChatView sendMessage(ChatController.SendRequest request, Principal principal) {
        if (principal == null) throw new IllegalArgumentException("Authenticated session required");
        return delivery.send(new SessionService.Actor(Long.parseLong(principal.getName()), "USER"),
                request.receiverId(), request.content(), request.clientMessageId());
    }
}
