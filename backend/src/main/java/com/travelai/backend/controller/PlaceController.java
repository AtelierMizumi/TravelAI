package com.travelai.backend.controller;

import com.travelai.backend.entity.Place;
import com.travelai.backend.repository.PlaceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceRepository repo;

    public PlaceController(PlaceRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Place> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Place> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Place> update(@PathVariable Long id, @RequestBody Place request) {
        return repo.findById(id).map(place -> {
            place.setName(request.getName()); place.setDescription(request.getDescription()); place.setImageUrl(request.getImageUrl());
            return ResponseEntity.ok(repo.save(place));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Place> add(@RequestBody Place place) {
        return ResponseEntity.ok(repo.save(place));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}