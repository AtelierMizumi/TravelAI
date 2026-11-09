package com.travelai.backend.controller;

import com.travelai.backend.admin.SystemSettingsService;
import com.travelai.backend.entity.SystemSettings;
import com.travelai.backend.security.ApiSecurity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-settings")
public class SystemSettingsController {

    private final SystemSettingsService service;

    public SystemSettingsController(SystemSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(service.publicView());
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody SystemSettings request) {
        return ResponseEntity.ok(service.update(ApiSecurity.currentActor(), request));
    }
}
