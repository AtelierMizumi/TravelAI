package com.travelai.backend.controller;

import com.travelai.backend.admin.SystemSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-only full settings view (gated by ApiSecurity /api/admin/** rule).
 */
@RestController
@RequestMapping("/api/admin/system-settings")
public class AdminSettingsController {

    private final SystemSettingsService service;

    public AdminSettingsController(SystemSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(service.current());
    }
}
