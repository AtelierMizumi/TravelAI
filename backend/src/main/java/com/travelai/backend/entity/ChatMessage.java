package com.travelai.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String clientMessageId;

    private Long senderId;
    private String senderName;
    @Column(columnDefinition = "TEXT") private String senderAvatar;

    private Long receiverId;
    private String receiverName;

    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String content;

    @JsonIgnore
    @Column(length = 32)
    private String contentEncryption;

    private Boolean isRead;

    private LocalDateTime createdAt;
}
