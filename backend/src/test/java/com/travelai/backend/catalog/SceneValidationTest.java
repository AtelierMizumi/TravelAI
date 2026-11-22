package com.travelai.backend.catalog;
import com.travelai.backend.entity.ImmersiveScene;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
class SceneValidationTest {
    private ImmersiveScene scene(String url) { return new ImmersiveScene("Phòng Deluxe",url,"Nhà cung cấp · được phép sử dụng","https://example.org/source","room"); }
    @Test void acceptsPublishedScenesAndExplicitRemoval() {
        assertDoesNotThrow(() -> SceneValidation.validate(List.of(scene("https://example.org/room.jpg"))));
        assertDoesNotThrow(() -> SceneValidation.validate(List.of()));
        assertDoesNotThrow(() -> SceneValidation.validate(null));
    }
    @Test void refusesExecutableAndUnattributedSources() {
        for (String url : List.of("javascript:alert(1)","http://example.org/photo.jpg","https://user:password@example.org/photo.jpg","data:image/jpeg;base64,AA"))
            assertThrows(ResponseStatusException.class, () -> SceneValidation.validate(List.of(scene(url))));
        var missing = scene("https://example.org/room.jpg"); missing.setAttribution("");
        assertThrows(ResponseStatusException.class, () -> SceneValidation.validate(List.of(missing)));
    }
    @Test void boundsTourSizeAndCategory() {
        assertThrows(ResponseStatusException.class, () -> SceneValidation.validate(Collections.nCopies(13,scene("https://example.org/room.jpg"))));
        var unknown = scene("https://example.org/room.jpg"); unknown.setCategory("unknown");
        assertThrows(ResponseStatusException.class, () -> SceneValidation.validate(List.of(unknown)));
    }
}
