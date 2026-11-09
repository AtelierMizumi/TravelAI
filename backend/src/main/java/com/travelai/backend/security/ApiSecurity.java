package com.travelai.backend.security;

import jakarta.servlet.http.*;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.*;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.Clock;
import java.util.regex.*;

@Configuration
public class ApiSecurity implements WebMvcConfigurer {
    private final SessionService sessions;
    public ApiSecurity(SessionService sessions) { this.sessions=sessions; }
    @Bean public static Clock businessClock() { return Clock.systemUTC(); }
    public static SessionService.Actor actor(HttpServletRequest request) {
        Object value=request.getAttribute("travelai.actor");
        if (!(value instanceof SessionService.Actor actor)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Sign in required");
        return actor;
    }
    public static SessionService.Actor currentActor() {
        var attributes = (org.springframework.web.context.request.ServletRequestAttributes)
                org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes();
        return actor(attributes.getRequest());
    }
    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override public boolean preHandle(HttpServletRequest request, HttpServletResponse response,Object handler) {
                String path=request.getRequestURI(), method=request.getMethod();
                if (method.equals("OPTIONS") || path.equals("/api/auth/login") || path.equals("/api/auth/register") || (method.equals("POST") && (path.equals("/api/auth/password-reset/request") || path.equals("/api/auth/password-reset/verify") || path.equals("/api/auth/password-reset/confirm")))) return true;
                if (method.equals("GET") && (path.matches("/api/(places|tours|hotels)(/.*)?") || path.matches("/api/ratings/(TOUR|HOTEL)/[0-9]+") || path.equals("/api/booking/offers") || path.equals("/api/system-settings"))) return true;
                SessionService.Actor actor=sessions.authenticate(request.getHeader("Authorization"));
                request.setAttribute("travelai.actor",actor);
                if ((!method.equals("GET") && path.equals("/api/system-settings")) || path.matches("/api/(admin|users|settings)(/.*)?")) actor.requireAdmin();
                if (path.matches("/api/(tour|hotel)-bookings(/.*)?")) {
                    if (!method.equals("GET")) throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Use /api/booking/reviews for SIMULATED payment-backed booking changes");
                    if (path.matches("/api/(tour|hotel)-bookings")) actor.requireAdmin();
                }
                if (!method.equals("GET") && path.matches("/api/(places|tours|hotels)(/.*)?")) actor.requireAdmin();
                Matcher owner=Pattern.compile("/api/(?:auth/(?:profile|change-password)|(?:tour|hotel)-bookings/user)/(\\d+)").matcher(path);
                if(owner.matches()) actor.requireOwner(Long.parseLong(owner.group(1)));
                return true;
            }
        }).addPathPatterns("/api/**");
    }
}
