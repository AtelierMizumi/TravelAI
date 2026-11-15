package com.travelai.backend.catalog;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.*;
import com.travelai.backend.entity.*;
import com.travelai.backend.repository.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.text.Normalizer;
import java.util.*;

@Service
public class LandmarkCatalog {
    private final PlaceRepository places;
    private final TourRepository tours;
    private final HotelRepository hotels;
    private final JsonNode data;
    private final Map<String,List<String>> provinces;
    private final Map<String,JsonNode> credits = new HashMap<>();
    public LandmarkCatalog(PlaceRepository places, TourRepository tours, HotelRepository hotels, ObjectMapper json) throws java.io.IOException {
        this.places=places; this.tours=tours; this.hotels=hotels;
        try(var stream=new ClassPathResource("catalog/landmarks.json").getInputStream()) { data=json.readTree(stream); }
        try(var stream=new ClassPathResource("catalog/provinces.json").getInputStream()) { provinces=json.readValue(stream,new TypeReference<LinkedHashMap<String,List<String>>>(){}); }
        var images=new ClassPathResource("catalog/image-credits.json");
        if(images.exists()) try(var stream=images.getInputStream()) { for(JsonNode row:json.readTree(stream)) credits.put(row.path("code").asText(),row); }
    }
    public static String normalize(String value) {
        return Normalizer.normalize(Objects.toString(value,""),Normalizer.Form.NFD).replaceAll("\\p{M}","")
            .toLowerCase(Locale.ROOT).replace('đ','d').replaceAll("[^a-z0-9]+"," ").trim();
    }
    public String province(String value) {
        Set<String> parts=new HashSet<>();
        for(String part:Objects.toString(value,"").split(",")) parts.add(normalize(part).replaceFirst("^(tinh|thanh pho) ",""));
        Set<String> matches=new HashSet<>();
        provinces.forEach((current,aliases)-> { if(aliases.stream().anyMatch(alias->parts.contains(normalize(alias)))) matches.add(current); });
        return matches.size()==1?matches.iterator().next():null;
    }
    @Bean ApplicationRunner synchronizeLandmarks(LandmarkCatalog service) { return args -> service.synchronize(); }
    @Transactional
    public void synchronize() {
        for(JsonNode row:data.path("landmarks")) {
            String code=row.path("code").asText();
            Place place=places.findByLandmarkCode(code).orElse(null);
            if(place==null) {
                Set<String> aliases=new HashSet<>(); aliases.add(normalize(row.path("name").asText()));
                aliases.add(normalize(row.path("wikipediaTitle").asText()));
                var existing=places.findAll().stream().filter(p->p.getLandmarkCode()==null && aliases.contains(normalize(p.getName()))).toList();
                place=existing.size()==1?existing.getFirst():new Place();
                place.setLandmarkCode(code);
                if(place.getName()==null) place.setName(row.path("name").asText());
            }
            place.setProvince(row.path("province").asText());
            place.setLatitude(row.path("latitude").asDouble()); place.setLongitude(row.path("longitude").asDouble());
            place.setLocalModelEnabled(row.path("localModelEnabled").asBoolean());
            if(place.getDescription()==null || place.getDescription().isBlank()) place.setDescription(row.path("description").asText());
            JsonNode image=credits.get(code);
            if(image!=null && (place.getImageUrl()==null || place.getImageUrl().isBlank())) {
                place.setImageUrl(image.path("downloadUrl").asText());
                place.setImageAttribution(image.path("sourceUrl").asText()+" | "+image.path("license").asText()+" | "+image.path("artist").asText().replaceAll("<[^>]+>",""));
            }
            places.save(place);
        }
        for(Tour tour:tours.findAll()) {
            String value=province(tour.getProvince()!=null?tour.getProvince():tour.getLocation());
            if(value!=null) { tour.setProvince(value); tours.save(tour); }
        }
        for(Hotel hotel:hotels.findAll()) {
            String value=province(hotel.getProvince()!=null?hotel.getProvince():hotel.getLocation());
            if(value!=null) { hotel.setProvince(value); hotels.save(hotel); }
        }
    }
    public Place resolve(String code) {
        return places.findByLandmarkCode(code).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Địa danh chưa có trong danh mục."));
    }
    public Map<String,Object> services(long id) {
        Place place=places.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy địa danh."));
        String region=province(place.getProvince());
        List<Tour> relatedTours=region==null?List.of():tours.findAllByOrderByIdDesc().stream()
            .filter(t->"active".equalsIgnoreCase(t.getStatus()) && region.equals(province(t.getProvince()!=null?t.getProvince():t.getLocation()))).toList();
        List<Hotel> relatedHotels=region==null?List.of():hotels.findAllByOrderByIdDesc().stream()
            .filter(h->"active".equalsIgnoreCase(h.getStatus()) && region.equals(province(h.getProvince()!=null?h.getProvince():h.getLocation()))).toList();
        Map<String,Object> result=new LinkedHashMap<>(); result.put("place",place); result.put("province",region);
        result.put("tours",relatedTours); result.put("hotels",relatedHotels); result.put("matchType","SAME_PROVINCE");
        return result;
    }
}
