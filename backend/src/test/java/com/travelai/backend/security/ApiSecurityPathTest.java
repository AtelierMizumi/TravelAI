package com.travelai.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Admin/owner rules must hold for every URI spelling Spring MVC routes to the same handler. */
class ApiSecurityPathTest {
    static class ExposedRegistry extends InterceptorRegistry {
        List<Object> all() { return getInterceptors(); }
    }

    private HandlerInterceptor interceptorFor(SessionService.Actor actor) {
        SessionService sessions = mock(SessionService.class);
        when(sessions.authenticate(any())).thenReturn(actor);
        ExposedRegistry registry = new ExposedRegistry();
        new ApiSecurity(sessions).addInterceptors(registry);
        return (HandlerInterceptor) registry.all().getFirst();
    }

    private int statusOf(HandlerInterceptor interceptor, String method, String uri) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, uri);
        request.setRequestURI(uri);
        request.addHeader("Authorization", "Bearer synthetic");
        try {
            interceptor.preHandle(request, new MockHttpServletResponse(), new Object());
            return 200;
        } catch (ResponseStatusException error) {
            return error.getStatusCode().value();
        } catch (Exception error) {
            throw new AssertionError(error);
        }
    }

    @Test void plainAdminPathIsForbiddenForNormalUser() {
        var user = interceptorFor(new SessionService.Actor(7, "USER"));
        assertEquals(403, statusOf(user, "PUT", "/api/users/7/make-admin"));
    }

    @Test void semicolonMatrixParametersDoNotBypassAdminCheck() {
        var user = interceptorFor(new SessionService.Actor(7, "USER"));
        assertEquals(403, statusOf(user, "PUT", "/api/users;x=1/7/make-admin"));
        assertEquals(403, statusOf(user, "GET", "/api/admin;x=1/users"));
        assertEquals(403, statusOf(user, "POST", "/api/places;x=1"));
    }

    @Test void duplicateSlashesAndDotSegmentsDoNotBypassAdminCheck() {
        var user = interceptorFor(new SessionService.Actor(7, "USER"));
        assertEquals(403, statusOf(user, "PUT", "/api//users/7/make-admin"));
        assertEquals(403, statusOf(user, "PUT", "/api/./users/7/make-admin"));
        assertEquals(403, statusOf(user, "PUT", "/api/places/../users/7/make-admin"));
    }

    @Test void ownerRuleCannotBeBypassedWithMatrixParameters() {
        var user = interceptorFor(new SessionService.Actor(7, "USER"));
        assertEquals(403, statusOf(user, "PUT", "/api/auth/profile;x=1/8"));
        assertEquals(403, statusOf(user, "PUT", "/api/auth/profile/8"));
        assertEquals(200, statusOf(user, "PUT", "/api/auth/profile/7"));
    }

    @Test void adminStillPasses() {
        var admin = interceptorFor(new SessionService.Actor(1, "ADMIN"));
        assertEquals(200, statusOf(admin, "PUT", "/api/users/7/make-admin"));
    }
}
