package com.travelai.backend.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.*;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;

@Configuration
public class SocketSecurity implements WebSocketMessageBrokerConfigurer {
    private final SessionService sessions;
    public SocketSecurity(SessionService sessions) { this.sessions = sessions; }
    @Override public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor headers = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (headers == null || headers.getCommand() == null) return message;
                var attributes = headers.getSessionAttributes();
                if (headers.getCommand() == StompCommand.CONNECT) {
                    String bearer = headers.getFirstNativeHeader("Authorization");
                    SessionService.Actor actor = sessions.authenticate(bearer);
                    if (attributes == null) throw new IllegalArgumentException("Session required");
                    attributes.put("travelai.bearer", bearer);
                    headers.setUser(() -> Long.toString(actor.id()));
                } else if (headers.getCommand() == StompCommand.SEND || headers.getCommand() == StompCommand.SUBSCRIBE) {
                    if (attributes == null) throw new IllegalArgumentException("Session required");
                    SessionService.Actor actor = sessions.authenticate((String) attributes.get("travelai.bearer"));
                    String destination = headers.getDestination();
                    boolean privateChannel = destination != null && destination.matches("/topic/(messages|notifications|chat-unread)/" + actor.id());
                    boolean adminChannel = actor.admin() && "/topic/admin-notifications".equals(destination);
                    boolean sharedChannel = "/topic/feed".equals(destination) ||
                            (destination != null && destination.matches("/topic/inventory/[0-9a-fA-F-]{36}"));
                    if (headers.getCommand() == StompCommand.SUBSCRIBE && !privateChannel && !adminChannel && !sharedChannel)
                        throw new IllegalArgumentException("Private channel access denied");
                    if (headers.getCommand() == StompCommand.SEND && !"/app/chat.send".equals(destination))
                        throw new IllegalArgumentException("Unsupported destination");
                }
                return message;
            }
        });
    }
}
