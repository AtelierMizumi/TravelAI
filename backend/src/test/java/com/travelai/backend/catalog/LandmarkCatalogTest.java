package com.travelai.backend.catalog;

import com.travelai.backend.entity.*;
import com.travelai.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;
import java.util.*;

@SpringBootTest
@Transactional
class LandmarkCatalogTest {
    @Autowired LandmarkCatalog catalog;
    @Autowired TourRepository tours;
    @Autowired HotelRepository hotels;

    @Test void resolvesCatalogAndKeepsOnlySameProvince() {
        var place = catalog.resolve("chua_cau_hoi_an");
        assertEquals("Đà Nẵng", place.getProvince());
        assertEquals("Huế", catalog.province("Thừa Thiên Huế"));
        assertEquals("Đà Nẵng", catalog.province("Hội An, Quảng Nam"));
        assertNull(catalog.province("Hà Nội, Đà Nẵng"));
        var same = tours.save(Tour.builder().name("Synthetic same").location("Hội An, Quảng Nam").status("active").build());
        var other = tours.save(Tour.builder().name("Synthetic other").location("Hà Nội").status("active").build());
        var hotel = hotels.save(Hotel.builder().name("Synthetic hotel").location("Đà Nẵng").status("active").build());
        var inactive = hotels.save(Hotel.builder().name("Synthetic inactive").location("Đà Nẵng").status("inactive").build());
        var result = catalog.services(place.getId());
        var selectedTours = (List<?>) result.get("tours");
        var selectedHotels = (List<?>) result.get("hotels");
        assertTrue(selectedTours.stream().map(Tour.class::cast).anyMatch(t -> t.getId().equals(same.getId())));
        assertFalse(selectedTours.stream().map(Tour.class::cast).anyMatch(t -> t.getId().equals(other.getId())));
        assertTrue(selectedHotels.stream().map(Hotel.class::cast).anyMatch(h -> h.getId().equals(hotel.getId())));
        assertFalse(selectedHotels.stream().map(Hotel.class::cast).anyMatch(h -> h.getId().equals(inactive.getId())));
    }
}
