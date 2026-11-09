package com.travelai.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;      // người nhận
    private Long actorId;     // người tạo hành động
    private String actorName;

    private String type;      // FOLLOW, LIKE, COMMENT, SHARE, MESSAGE, BOOKING, REMINDER

    private String title;

    @Column(length = 3000)
    private String message;

    private Long targetId;

    private String targetReference;

    private Boolean isRead;

    private LocalDateTime createdAt;
}