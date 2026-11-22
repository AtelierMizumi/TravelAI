package com.travelai.backend.catalog;

import com.travelai.backend.entity.ImmersiveScene;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.util.List;

public final class SceneValidation {
    private SceneValidation() {}
    private static boolean https(String value) {
        try { URI uri = URI.create(value); return "https".equals(uri.getScheme()) && uri.getHost() != null && uri.getUserInfo() == null && value.length() <= 2048; }
        catch (RuntimeException ignored) { return false; }
    }
    public static void validate(List<ImmersiveScene> scenes) {
        if (scenes == null) return;
        if (scenes.size() > 12) throw invalid();
        for (var scene : scenes) {
            if (scene == null || scene.getLabel() == null || scene.getLabel().isBlank() || scene.getLabel().length() > 120
                || !https(scene.getPanoramaUrl()) || !https(scene.getSourceUrl())
                || scene.getAttribution() == null || scene.getAttribution().isBlank() || scene.getAttribution().length() > 1000
                || !List.of("area", "building", "room").contains(scene.getCategory() == null ? "" : scene.getCategory())) throw invalid();
        }
    }
    private static ResponseStatusException invalid() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh 360 cần tên cảnh, loại khu vực/tòa nhà/phòng, URL HTTPS, nguồn và quyền sử dụng; tối đa 12 cảnh.");
    }
}
