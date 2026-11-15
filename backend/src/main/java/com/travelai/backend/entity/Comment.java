package com.travelai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long postId;

    private Long userId;

    private String userName;

    @Column(columnDefinition = "TEXT")
    private String userAvatar;

    @Column(length = 3000)
    private String text;

    private LocalDateTime createdAt;
}
