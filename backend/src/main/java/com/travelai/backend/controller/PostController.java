package com.travelai.backend.controller;

import com.travelai.backend.entity.Comment;
import com.travelai.backend.entity.User;
import com.travelai.backend.repository.UserRepository;
import com.travelai.backend.security.ApiSecurity;
import com.travelai.backend.entity.Notification;
import com.travelai.backend.service.NotificationPublisher;
import com.travelai.backend.entity.Post;
import com.travelai.backend.entity.PostLike;
import com.travelai.backend.entity.Share;
import com.travelai.backend.repository.CommentRepository;
import com.travelai.backend.repository.PostLikeRepository;
import com.travelai.backend.repository.PostRepository;
import com.travelai.backend.repository.ShareRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final UserRepository users;
    private final PostRepository postRepository;
    private final PostLikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final ShareRepository shareRepository;
    private final NotificationPublisher notificationPublisher;
    private final com.travelai.backend.community.PostAccessPolicy policy;

    public PostController(
            UserRepository users,
            PostRepository postRepository,
            PostLikeRepository likeRepository,
            CommentRepository commentRepository,
            ShareRepository shareRepository,
            NotificationPublisher notificationPublisher,
            com.travelai.backend.community.PostAccessPolicy policy
    ) {
        this.users = users;
        this.postRepository = postRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.shareRepository = shareRepository;
        this.notificationPublisher = notificationPublisher;
        this.policy = policy;
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(@RequestParam(required = false) Long userId) {
        userId = ApiSecurity.currentActor().id();
        final Long viewerId = userId;
        var actor = ApiSecurity.currentActor();
        return ResponseEntity.ok(
                postRepository.findByStatusOrderByCreatedAtDesc("APPROVED")
                        .stream()
                        .map(post -> mapPost(post, actor))
                        .toList()
        );
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllPostsForAdmin() {
        var actor = ApiSecurity.currentActor();
        return ResponseEntity.ok(postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> mapPost(post, actor))
                .toList());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(@PathVariable Long userId) {
        var actor = ApiSecurity.currentActor();
        boolean owner = actor.id() == userId;
        return ResponseEntity.ok(postRepository.findByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .filter(post -> owner || actor.admin() || policy.canReadFeed(post, actor))
                .map(post -> mapPost(post, actor))
                .toList());
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post request) {
        User author = currentUser();
        request.setAuthorId(author.getId()); request.setAuthorName(author.getName()); request.setAuthorAvatar(author.getAvatar());
        if ((request.getContent() == null || request.getContent().trim().isEmpty())
                && (request.getImage() == null || request.getImage().isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập nội dung hoặc chọn ảnh"));
        }

        Post post = Post.builder()
                .authorId(request.getAuthorId())
                .authorName(request.getAuthorName())
                .authorAvatar(request.getAuthorAvatar())
                .content(request.getContent())
                .image(request.getImage())
                .shareCount(0)
                .originalPostId(request.getOriginalPostId())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Post saved = postRepository.save(post);

        notificationPublisher.save(
                Notification.builder()
                        .userId(0L)
                        .actorId(saved.getAuthorId())
                        .actorName(saved.getAuthorName())
                        .type("ADMIN_POST")
                        .title("Bài viết mới chờ duyệt")
                        .message(saved.getAuthorName() + " vừa đăng bài mới cần duyệt.")
                        .targetId(saved.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Post request) {
        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Post not found"));
        }
        ApiSecurity.currentActor().requireOwner(post.getAuthorId());

        post.setContent(request.getContent());
        post.setImage(request.getImage());
        post.setStatus("PENDING");

        Post saved = postRepository.save(post);

        notificationPublisher.save(
                Notification.builder()
                        .userId(0L)
                        .actorId(saved.getAuthorId())
                        .actorName(saved.getAuthorName())
                        .type("ADMIN_POST")
                        .title("Bài viết được sửa chờ duyệt")
                        .message(saved.getAuthorName() + " vừa sửa bài viết cần duyệt lại.")
                        .targetId(saved.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Post not found"));
        }
        ApiSecurity.currentActor().requireOwner(post.getAuthorId());

        if (post.getOriginalPostId() != null) {
            Post original = postRepository.findById(post.getOriginalPostId()).orElse(null);

            if (original != null) {
                int currentShare = original.getShareCount() == null ? 0 : original.getShareCount();
                original.setShareCount(Math.max(0, currentShare - 1));
                postRepository.save(original);
            }
        }

        postRepository.delete(post);

        return ResponseEntity.ok(Map.of("message", "Delete post successfully"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approvePost(@PathVariable Long id) {
        ApiSecurity.currentActor().requireAdmin();
        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Post not found"));
        }

        post.setStatus("APPROVED");
        Post saved = postRepository.save(post);

        notificationPublisher.save(
                Notification.builder()
                        .userId(post.getAuthorId())
                        .actorId(null)
                        .actorName("TravelAI Admin")
                        .type("POST_APPROVED")
                        .title("Bài viết đã được duyệt")
                        .message("Bài viết của bạn đã được duyệt và hiển thị trên Feed.")
                        .targetId(post.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectPost(@PathVariable Long id) {
        ApiSecurity.currentActor().requireAdmin();
        Post post = postRepository.findById(id).orElse(null);

        if (post == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Post not found"));
        }

        post.setStatus("REJECTED");
        Post saved = postRepository.save(post);

        notificationPublisher.save(
                Notification.builder()
                        .userId(post.getAuthorId())
                        .actorId(null)
                        .actorName("TravelAI Admin")
                        .type("POST_REJECTED")
                        .title("Bài viết bị từ chối")
                        .message("Bài viết của bạn chưa được duyệt.")
                        .targetId(post.getId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long postId, @RequestBody Map<String, Object> body) {
        User viewer = currentUser();
        body.put("userId", viewer.getId()); body.put("userName", viewer.getName());
        Long userId = Long.valueOf(body.get("userId").toString());
        String userName = body.get("userName") == null ? "Người dùng" : body.get("userName").toString();

        Post post = postRepository.findById(postId).orElse(null);

        if (post == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Post not found"));
        }

        if (!policy.canLike(post, ApiSecurity.currentActor())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Post is not visible to you");
        }

        PostLike existing = likeRepository.findByPostIdAndUserId(postId, userId).orElse(null);

        if (existing != null) {
            likeRepository.delete(existing);
            return ResponseEntity.ok(Map.of(
                    "liked", false,
                    "likesCount", likeRepository.countByPostId(postId)
            ));
        }

        try {
            likeRepository.saveAndFlush(PostLike.builder()
                    .postId(postId)
                    .userId(userId)
                    .build());
        } catch (DataIntegrityViolationException e) {
            // Concurrent duplicate toggle: treat as already liked (idempotent).
            return ResponseEntity.ok(Map.of(
                    "liked", true,
                    "likesCount", likeRepository.countByPostId(postId)
            ));
        }

        if (!post.getAuthorId().equals(userId)) {
            notificationPublisher.save(
                    Notification.builder()
                            .userId(post.getAuthorId())
                            .actorId(userId)
                            .actorName(userName)
                            .type("LIKE")
                            .title("Lượt thích mới")
                            .message("đã thích bài viết của bạn")
                            .targetId(postId)
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .build()
            );
        }

        return ResponseEntity.ok(Map.of(
                "liked", true,
                "likesCount", likeRepository.countByPostId(postId)
        ));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long postId, @RequestBody Comment request) {
        User viewer = currentUser();
        request.setUserId(viewer.getId()); request.setUserName(viewer.getName()); request.setUserAvatar(viewer.getAvatar());
        Post post = postRepository.findById(postId).orElse(null);

        if (post == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Post not found"));
        }

        if (!policy.canComment(post, ApiSecurity.currentActor())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Post is not visible to you");
        }

        if (request.getText() == null || request.getText().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment is empty"));
        }

        Comment saved = commentRepository.save(
                Comment.builder()
                        .postId(postId)
                        .userId(request.getUserId())
                        .userName(request.getUserName())
                        .userAvatar(request.getUserAvatar())
                        .text(request.getText())
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        if (!post.getAuthorId().equals(request.getUserId())) {
            notificationPublisher.save(
                    Notification.builder()
                            .userId(post.getAuthorId())
                            .actorId(request.getUserId())
                            .actorName(request.getUserName())
                            .type("COMMENT")
                            .title("Bình luận mới")
                            .message("đã bình luận bài viết của bạn")
                            .targetId(postId)
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .build()
            );
        }

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{postId}/share")
    public ResponseEntity<?> sharePost(@PathVariable Long postId, @RequestBody Share request) {
        User viewer = currentUser();
        request.setUserId(viewer.getId()); request.setUserName(viewer.getName()); request.setUserAvatar(viewer.getAvatar());
        Post original = postRepository.findById(postId).orElse(null);

        if (original == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Original post not found"));
        }

        if (!policy.canShareFrom(original, ApiSecurity.currentActor())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Post is not visible to you");
        }

        shareRepository.save(
                Share.builder()
                        .postId(postId)
                        .userId(request.getUserId())
                        .userName(request.getUserName())
                        .userAvatar(request.getUserAvatar())
                        .caption(request.getCaption())
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        postRepository.incrementShareCount(postId);

        Post sharedPost = Post.builder()
                .authorId(request.getUserId())
                .authorName(request.getUserName())
                .authorAvatar(request.getUserAvatar())
                .content(request.getCaption())
                .image(original.getImage())
                .shareCount(0)
                .originalPostId(postId)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Post savedSharedPost = postRepository.save(sharedPost);

        if (!original.getAuthorId().equals(request.getUserId())) {
            notificationPublisher.save(
                    Notification.builder()
                            .userId(original.getAuthorId())
                            .actorId(request.getUserId())
                            .actorName(request.getUserName())
                            .type("SHARE")
                            .title("Chia sẻ mới")
                            .message("đã chia sẻ bài viết của bạn")
                            .targetId(postId)
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .build()
            );
        }

        return ResponseEntity.ok(savedSharedPost);
    }

    private User currentUser() {
        return users.findById(ApiSecurity.currentActor().id()).orElseThrow();
    }
    private Map<String, Object> mapPost(Post post, com.travelai.backend.security.SessionService.Actor actor) {
        Map<String, Object> data = new HashMap<>();
        Long userId = actor == null ? null : actor.id();

        data.put("id", post.getId());
        data.put("authorId", post.getAuthorId());
        data.put("authorName", post.getAuthorName());
        data.put("authorAvatar", post.getAuthorAvatar());
        data.put("content", post.getContent());
        data.put("image", post.getImage());
        data.put("status", post.getStatus());
        data.put("shareCount", post.getShareCount() == null ? 0 : post.getShareCount());
        data.put("sharesCount", post.getShareCount() == null ? 0 : post.getShareCount());
        data.put("originalPostId", post.getOriginalPostId());
        data.put("createdAt", post.getCreatedAt());

        data.put("likesCount", likeRepository.countByPostId(post.getId()));

        boolean liked = userId != null &&
                likeRepository.findByPostIdAndUserId(post.getId(), userId).isPresent();

        data.put("liked", liked);

        var comments = commentRepository.findByPostIdOrderByCreatedAtAsc(post.getId());

        data.put("comments", comments);
        data.put("commentsCount", comments.size());

        if (post.getOriginalPostId() != null) {
            Post original = postRepository.findById(post.getOriginalPostId()).orElse(null);

            if (original != null && policy.canLike(original, actor)) {
                Map<String, Object> originalData = new HashMap<>();
                originalData.put("id", original.getId());
                originalData.put("authorId", original.getAuthorId());
                originalData.put("authorName", original.getAuthorName());
                originalData.put("authorAvatar", original.getAuthorAvatar());
                originalData.put("content", original.getContent());
                originalData.put("image", original.getImage());
                originalData.put("createdAt", original.getCreatedAt());
                data.put("originalPost", originalData);
            } else {
                data.put("originalPost", null);
            }
        } else {
            data.put("originalPost", null);
        }

        return data;
    }
}