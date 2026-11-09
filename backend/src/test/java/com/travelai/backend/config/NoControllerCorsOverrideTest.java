package com.travelai.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

/** Controller-level @CrossOrigin overrides CorsConfig and re-opens wildcard origins. */
class NoControllerCorsOverrideTest {
    @Test void noRestControllerDeclaresItsOwnCorsPolicy() throws Exception {
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(RestController.class));
        List<String> offenders = new ArrayList<>();
        for (BeanDefinition definition : scanner.findCandidateComponents("com.travelai.backend")) {
            Class<?> type = Class.forName(definition.getBeanClassName());
            boolean onType = type.isAnnotationPresent(CrossOrigin.class);
            boolean onMethod = java.util.Arrays.stream(type.getDeclaredMethods()).anyMatch(m -> m.isAnnotationPresent(CrossOrigin.class));
            if (onType || onMethod) offenders.add(type.getSimpleName());
        }
        assertTrue(offenders.isEmpty(), "Remove @CrossOrigin (CorsConfig is the single policy): " + offenders);
    }
}
