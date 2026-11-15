package com.travelai.backend.controller;

import com.travelai.backend.entity.Notification;
import com.travelai.backend.service.NotificationPublisher;
import com.travelai.backend.security.ApiSecurity;
import com.travelai.backend.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repository;
    private final NotificationPublisher publisher;

    public NotificationController(NotificationRepository repository, NotificationPublisher publisher) {
        this.publisher = publisher;
        this.repository = repository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable Long userId) {
        ApiSecurity.currentActor().requireOwner(userId);
        return ResponseEntity.ok(
                repository.findByUserIdOrderByCreatedAtDesc(userId)
        );
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<?> unreadCount(@PathVariable Long userId) {
        ApiSecurity.currentActor().requireOwner(userId);
        return ResponseEntity.ok(
                Map.of("count", repository.countByUserIdAndIsReadFalse(userId))
        );
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Notification request) {
        ApiSecurity.currentActor().requireAdmin();
        Notification noti = Notification.builder()
                .userId(request.getUserId())
                .actorId(request.getActorId())
                .actorName(request.getActorName())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .targetId(request.getTargetId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(publisher.save(noti));
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        Notification noti = repository.findById(id).orElse(null);

        if (noti == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Notification not found")
            );
        }

        ApiSecurity.currentActor().requireOwner(noti.getUserId());
        noti.setIsRead(true);

        Notification saved = repository.save(noti);
        publisher.changed(saved);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/read-all/{userId}")
    public ResponseEntity<?> markAllRead(@PathVariable Long userId) {
        ApiSecurity.currentActor().requireOwner(userId);
        var list = repository.findByUserIdOrderByCreatedAtDesc(userId);

        list.forEach(n -> n.setIsRead(true));

        repository.saveAll(list);
        if (!list.isEmpty()) publisher.changed(list.get(0));

        return ResponseEntity.ok(Map.of("message", "All notifications read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Notification notification = repository.findById(id).orElseThrow();
        ApiSecurity.currentActor().requireOwner(notification.getUserId());
        repository.deleteById(id);
        publisher.changed(notification);

        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}