package com.travelai.backend.catalog;

import com.travelai.backend.entity.Place;
import com.travelai.backend.repository.PlaceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class PlaceImageStorageTest {
    @Autowired PlaceRepository places;

    @Test void placeImageCanHoldAPickedPhotoAsADataUrl() {
        String dataUrl = "data:image/jpeg;base64," + "A".repeat(60_000);
        Place place = new Place();
        place.setName("Image storage fixture");
        place.setImageUrl(dataUrl);
        Long id = places.save(place).getId();
        assertEquals(dataUrl, places.findById(id).orElseThrow().getImageUrl());
        places.deleteById(id);
    }
}
