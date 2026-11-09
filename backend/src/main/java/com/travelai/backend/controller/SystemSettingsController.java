package com.travelai.backend.controller;

import com.travelai.backend.entity.SystemSettings;
import com.travelai.backend.repository.SystemSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-settings")
public class SystemSettingsController {

    private final SystemSettingsRepository repository;

    public SystemSettingsController(SystemSettingsRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<?> getSettings() {
        SystemSettings settings = repository.findById(1L).orElseGet(() -> {
            SystemSettings created = SystemSettings.builder()
                    .id(1L)
                    .siteName("Travel AI Admin")
                    .adminEmail("admin@travel.com")
                    .emailNotify(true)
                    .systemNotify(true)
                    .maintenanceMode(false)
                    .build();

            return repository.save(created);
        });

        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody SystemSettings request) {
        SystemSettings settings = repository.findById(1L).orElse(
                SystemSettings.builder()
                        .id(1L)
                        .build()
        );

        settings.setSiteName(request.getSiteName());
        settings.setAdminEmail(request.getAdminEmail());
        settings.setEmailNotify(request.getEmailNotify());
        settings.setSystemNotify(request.getSystemNotify());
        settings.setMaintenanceMode(request.getMaintenanceMode());

        return ResponseEntity.ok(repository.save(settings));
    }
}