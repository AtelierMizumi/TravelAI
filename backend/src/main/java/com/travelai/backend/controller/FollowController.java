package com.travelai.backend.controller;

import com.travelai.backend.entity.Follow;
import com.travelai.backend.security.ApiSecurity;
import com.travelai.backend.entity.Notification;
import com.travelai.backend.service.NotificationPublisher;
import com.travelai.backend.repository.FollowRepository;
import com.travelai.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowRepository followRepository;
    private final NotificationPublisher notificationPublisher;
    private final UserRepository userRepository;

    public FollowController(
            FollowRepository followRepository,
            NotificationPublisher notificationPublisher,
            UserRepository userRepository
    ) {
        this.followRepository = followRepository;
        this.notificationPublisher = notificationPublisher;
        this.userRepository = userRepository;
    }

    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFollow(
            @RequestBody Map<String, Long> body
    ) {
        Long followerId = ApiSecurity.currentActor().id();
        Long followingId = body.get("followingId");

        if (followerId == null || followingId == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Thiếu followerId hoặc followingId")
            );
        }

        if (followerId.equals(followingId)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Không thể tự theo dõi chính mình")
            );
        }

        if (userRepository.findById(followingId).filter(user -> "active".equalsIgnoreCase(user.getStatus())).isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "User unavailable"));
        Optional<Follow> existing =
                followRepository.findByFollowerIdAndFollowingId(
                        followerId,
                        followingId
                );

        if (existing.isPresent()) {
            followRepository.delete(existing.get());

            return ResponseEntity.ok(
                    Map.of("following", false)
            );
        }

        Follow follow = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();

        followRepository.save(follow);

        String followerName = userRepository
                .findById(followerId)
                .map(user -> user.getName())
                .orElse("Người dùng");

        notificationPublisher.save(
                Notification.builder()
                        .userId(followingId)
                        .actorId(followerId)
                        .actorName(followerName)
                        .type("FOLLOW")
                        .title("Người theo dõi mới")
                        .message("đã theo dõi bạn")
                        .targetId(followerId)
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(
                Map.of("following", true)
        );
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getStats(
            @PathVariable Long userId
    ) {
        Long followers =
                followRepository.countByFollowingId(userId);

        Long following =
                followRepository.countByFollowerId(userId);

        return ResponseEntity.ok(
                Map.of(
                        "followers", followers,
                        "following", following
                )
        );
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkFollow(
            @RequestParam Long followerId,
            @RequestParam Long followingId
    ) {
        ApiSecurity.currentActor().requireOwner(followerId);
        boolean following =
                followRepository
                        .findByFollowerIdAndFollowingId(
                                followerId,
                                followingId
                        )
                        .isPresent();

        return ResponseEntity.ok(
                Map.of("following", following)
        );
    }
}