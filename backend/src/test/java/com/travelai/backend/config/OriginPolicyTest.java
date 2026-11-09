package com.travelai.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.socket.config.annotation.SockJsServiceRegistration;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OriginPolicyTest {
    static final String ORIGIN = "https://travelai.example";

    static class ExposedRegistry extends CorsRegistry {
        Map<String, CorsConfiguration> configurations() { return getCorsConfigurations(); }
    }

    @Test void parsesCommaSeparatedOriginsAndTrims() {
        assertArrayEquals(new String[]{ORIGIN, "http://localhost:8081"},
                OriginPolicy.parse(" " + ORIGIN + " , http://localhost:8081 ,"));
    }

    @Test void rejectsWildcardAndBlank() {
        assertThrows(IllegalStateException.class, () -> OriginPolicy.parse("*"));
        assertThrows(IllegalStateException.class, () -> OriginPolicy.parse("https://a.example,*"));
        assertThrows(IllegalStateException.class, () -> OriginPolicy.parse("  "));
    }

    @Test void restCorsAllowsOnlyConfiguredOrigin() {
        ExposedRegistry registry = new ExposedRegistry();
        new CorsConfig(ORIGIN).corsConfigurer().addCorsMappings(registry);
        CorsConfiguration cors = registry.configurations().get("/api/**");
        assertNotNull(cors);
        assertEquals(ORIGIN, cors.checkOrigin(ORIGIN));
        assertNull(cors.checkOrigin("https://evil.example"));
    }

    @Test void webSocketEndpointsUseExactOriginsNotPatterns() {
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration native1 = mock(StompWebSocketEndpointRegistration.class, RETURNS_SELF);
        StompWebSocketEndpointRegistration sock = mock(StompWebSocketEndpointRegistration.class, RETURNS_SELF);
        when(sock.withSockJS()).thenReturn(mock(SockJsServiceRegistration.class));
        when(registry.addEndpoint("/ws-native")).thenReturn(native1);
        when(registry.addEndpoint("/ws")).thenReturn(sock);

        new WebSocketConfig(ORIGIN).registerStompEndpoints(registry);

        verify(native1).setAllowedOrigins(ORIGIN);
        verify(sock).setAllowedOrigins(ORIGIN);
        verify(native1, never()).setAllowedOriginPatterns(any(String[].class));
        verify(sock, never()).setAllowedOriginPatterns(any(String[].class));
    }
}
