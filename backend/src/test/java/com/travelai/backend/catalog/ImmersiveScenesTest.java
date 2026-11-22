package com.travelai.backend.catalog;
import com.travelai.backend.entity.*;
import com.travelai.backend.repository.*;
import jakarta.persistence.EntityManager;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest @Transactional
class ImmersiveScenesTest {
    @Autowired HotelRepository hotels;
    @Autowired PlaceRepository places;
    @Autowired EntityManager entities;
    @Test void persistsOrderedHotelAndDestinationScenesAndRemoval() {
        var outside = new ImmersiveScene("Mặt tiền","https://example.org/outside.jpg","Provider · licensed","https://example.org/source","building");
        var room = new ImmersiveScene("Phòng","https://example.org/room.jpg","Provider · licensed","https://example.org/source","room");
        var hotel = hotels.save(Hotel.builder().name("Synthetic 360 hotel").status("active").scenes(new ArrayList<>(List.of(outside,room))).build());
        var place = places.save(Place.builder().name("Synthetic 360 destination").scenes(new ArrayList<>(List.of(new ImmersiveScene("Lối vào","https://example.org/area.jpg","Provider · licensed","https://example.org/source","area")))).build());
        entities.flush(); entities.clear();
        var loaded = hotels.findById(hotel.getId()).orElseThrow();
        assertEquals(List.of("Mặt tiền","Phòng"), loaded.getScenes().stream().map(ImmersiveScene::getLabel).toList());
        assertEquals("area", places.findById(place.getId()).orElseThrow().getScenes().getFirst().getCategory());
        loaded.getScenes().clear(); hotels.save(loaded); entities.flush(); entities.clear();
        assertTrue(hotels.findById(hotel.getId()).orElseThrow().getScenes().isEmpty());
    }
    @Test void requestBodyWithoutScenesLeavesScenesUntouched() throws Exception {
        var json = new com.fasterxml.jackson.databind.ObjectMapper();
        assertNull(json.readValue("{\"name\":\"Edit without scenes\"}", Hotel.class).getScenes());
        assertNull(json.readValue("{\"name\":\"Edit without scenes\"}", Place.class).getScenes());
        assertEquals(1, json.readValue("{\"name\":\"x\",\"scenes\":[{\"label\":\"a\"}]}", Hotel.class).getScenes().size());
    }
}
