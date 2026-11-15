package com.travelai.backend.config;

import com.travelai.backend.service.NotificationPublisher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FeedEventsConfig implements WebMvcConfigurer {
    private final NotificationPublisher events;
    public FeedEventsConfig(NotificationPublisher events) { this.events = events; }

    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                                  Object handler, Exception exception) {
                if (exception == null && response.getStatus() < 400 &&
                        ("POST".equals(request.getMethod()) || "PUT".equals(request.getMethod()) || "DELETE".equals(request.getMethod()))) {
                    events.feedChanged();
                }
            }
        }).addPathPatterns("/api/posts", "/api/posts/**");
    }
}
