package com.travelai.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SocketSecurityTest {
    static class Registration extends ChannelRegistration {
        List<ChannelInterceptor> interceptors() { return getInterceptors(); }
    }
    private Message<byte[]> frame(StompCommand command, Map<String,Object> session, String destination) {
        StompHeaderAccessor headers = StompHeaderAccessor.create(command);
        headers.setSessionAttributes(session);
        headers.setNativeHeader("Authorization", "Bearer synthetic-session");
        if (destination != null) headers.setDestination(destination);
        headers.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], headers.getMessageHeaders());
    }
    @Test void connectionAndSubscriptionUseServerAuthenticatedIdentity() {
        SessionService sessions = mock(SessionService.class);
        when(sessions.authenticate("Bearer synthetic-session")).thenReturn(new SessionService.Actor(7,"USER"));
        Registration registration = new Registration();
        new SocketSecurity(sessions).configureClientInboundChannel(registration);
        ChannelInterceptor security = registration.interceptors().getFirst();
        Map<String,Object> session = new HashMap<>();
        Message<byte[]> connect = frame(StompCommand.CONNECT,session,null);
        security.preSend(connect,mock(MessageChannel.class));
        assertEquals("7",StompHeaderAccessor.getAccessor(connect,StompHeaderAccessor.class).getUser().getName());
        assertNotNull(security.preSend(frame(StompCommand.SUBSCRIBE,session,"/topic/messages/7"),mock(MessageChannel.class)));
        assertNotNull(security.preSend(frame(StompCommand.SUBSCRIBE,session,"/topic/feed"),mock(MessageChannel.class)));
        assertNotNull(security.preSend(frame(StompCommand.SUBSCRIBE,session,"/topic/inventory/09742037-89ab-cdef-0123-456789abcdef"),mock(MessageChannel.class)));
        assertThrows(IllegalArgumentException.class,()->security.preSend(frame(StompCommand.SUBSCRIBE,session,"/topic/inventory/not-an-id"),mock(MessageChannel.class)));
        assertThrows(IllegalArgumentException.class,()->security.preSend(frame(StompCommand.SUBSCRIBE,session,"/topic/messages/8"),mock(MessageChannel.class)));
        assertThrows(IllegalArgumentException.class,()->security.preSend(frame(StompCommand.SEND,session,"/topic/messages/8"),mock(MessageChannel.class)));
        assertThrows(IllegalArgumentException.class,()->security.preSend(frame(StompCommand.SUBSCRIBE,session,"/topic/admin-notifications"),mock(MessageChannel.class)));
        when(sessions.authenticate("Bearer synthetic-session")).thenReturn(new SessionService.Actor(7,"ADMIN"));
        assertNotNull(security.preSend(frame(StompCommand.SUBSCRIBE,session,"/topic/admin-notifications"),mock(MessageChannel.class)));
    }
}
