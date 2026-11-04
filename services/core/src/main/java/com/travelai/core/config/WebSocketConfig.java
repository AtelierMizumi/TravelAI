package com.travelai.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Simple in-memory message broker destinations
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages handled by application @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
        // User destination prefix for private user messaging
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS fallback endpoint
        registry.addEndpoint("/ws-travelai")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Direct WebSocket endpoint
        registry.addEndpoint("/ws-travelai")
                .setAllowedOriginPatterns("*");
    }
}
