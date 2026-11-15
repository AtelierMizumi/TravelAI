package com.travelai.backend.config;

import java.util.Arrays;

/** Parses the explicit browser-origin allowlist shared by REST CORS and WebSocket handshakes. */
final class OriginPolicy {
    private OriginPolicy() {}

    static String[] parse(String csv) {
        String[] origins = Arrays.stream(csv == null ? new String[0] : csv.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
        if (origins.length == 0) {
            throw new IllegalStateException("travelai.cors.allowed-origins must list at least one origin");
        }
        if (Arrays.stream(origins).anyMatch(origin -> origin.contains("*"))) {
            throw new IllegalStateException("Wildcard origins are not allowed in travelai.cors.allowed-origins");
        }
        return origins;
    }
}
