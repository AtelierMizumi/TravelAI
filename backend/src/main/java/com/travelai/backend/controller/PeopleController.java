package com.travelai.backend.controller;

import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.util.*;

@RestController
@RequestMapping("/api/people")
public class PeopleController {
    private final UserRepository users;
    public PeopleController(UserRepository users) { this.users = users; }

    @GetMapping
    public List<Map<String,Object>> search(@RequestParam(defaultValue = "") String q) {
        String query = q.trim().toLowerCase(Locale.ROOT);
        return users.findAll().stream().filter(user -> "active".equalsIgnoreCase(user.getStatus()))
                .filter(user -> Objects.toString(user.getName(), "").toLowerCase(Locale.ROOT).contains(query))
                .limit(100).map(this::view).toList();
    }
    @GetMapping("/{id}")
    public Map<String,Object> get(@PathVariable Long id) {
        User user = users.findById(id).filter(value -> "active".equalsIgnoreCase(value.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User unavailable"));
        return view(user);
    }
    private Map<String,Object> view(User user) {
        return Map.of("id", user.getId(), "name", Objects.toString(user.getName(), ""),
                "bio", Objects.toString(user.getBio(), ""), "avatar", Objects.toString(user.getAvatar(), ""));
    }
}
