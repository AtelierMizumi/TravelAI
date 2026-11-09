package com.travelai.backend.admin;

import com.travelai.backend.entity.SystemSettings;
import com.travelai.backend.repository.SystemSettingsRepository;
import com.travelai.backend.security.SessionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * System settings read/update seam.
 * Public view intentionally keeps maintenanceMode because the mobile
 * _layout polls it for the maintenance banner; notification flags are
 * internal admin-only configuration.
 */
@Service
@Transactional
public class SystemSettingsService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final SystemSettingsRepository repository;

    public SystemSettingsService(SystemSettingsRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> publicView() {
        SystemSettings settings = current();
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("siteName", settings.getSiteName());
        view.put("adminEmail", settings.getAdminEmail());
        view.put("maintenanceMode", Boolean.TRUE.equals(settings.getMaintenanceMode()));
        return view;
    }

    public SystemSettings current() {
        return repository.findById(1L).orElseGet(() -> repository.saveAndFlush(
                SystemSettings.builder()
                        .id(1L)
                        .siteName("Travel AI Admin")
                        .adminEmail("admin@travel.com")
                        .emailNotify(true)
                        .systemNotify(true)
                        .maintenanceMode(false)
                        .build()));
    }

    public SystemSettings update(SessionService.Actor actor, SystemSettings request) {
        if (actor == null || !actor.admin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access required");
        }
        validate(request);
        SystemSettings settings = current();
        settings.setSiteName(request.getSiteName());
        settings.setAdminEmail(request.getAdminEmail());
        settings.setEmailNotify(request.getEmailNotify());
        settings.setSystemNotify(request.getSystemNotify());
        settings.setMaintenanceMode(request.getMaintenanceMode());
        return repository.saveAndFlush(settings);
    }

    private void validate(SystemSettings request) {
        if (request == null
                || request.getSiteName() == null
                || request.getSiteName().isBlank()
                || request.getSiteName().length() > 100
                || request.getAdminEmail() == null
                || !EMAIL.matcher(request.getAdminEmail()).matches()
                || request.getEmailNotify() == null
                || request.getSystemNotify() == null
                || request.getMaintenanceMode() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid system settings");
        }
    }
}
