package com.travelai.core.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_messages_conversation_id", columnList = "conversation_id"),
        @Index(name = "idx_chat_messages_sender_id", columnList = "sender_id"),
        @Index(name = "idx_chat_messages_recipient_id", columnList = "recipient_id"),
        @Index(name = "idx_chat_messages_is_read", columnList = "is_read"),
        @Index(name = "idx_chat_messages_created_at", columnList = "created_at")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "message_type", length = 32)
    private String messageType = "CHAT"; // "CHAT", "JOIN", "LEAVE", "ITINERARY_SHARE"

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "conversation_id", nullable = false, length = 64)
    private String conversationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ChatMessage() {
    }

    public ChatMessage(Long id, User sender, User recipient, String content, String messageType,
                       Boolean isRead, LocalDateTime readAt, String conversationId, LocalDateTime createdAt) {
        this.id = id;
        this.sender = sender;
        this.recipient = recipient;
        this.content = content;
        this.messageType = messageType != null ? messageType : "CHAT";
        this.isRead = isRead != null ? isRead : false;
        this.readAt = readAt;
        this.conversationId = conversationId;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
        if (this.messageType == null) {
            this.messageType = "CHAT";
        }
    }

    public static ChatMessageBuilder builder() {
        return new ChatMessageBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getRecipient() {
        return recipient;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class ChatMessageBuilder {
        private Long id;
        private User sender;
        private User recipient;
        private String content;
        private String messageType = "CHAT";
        private Boolean isRead = false;
        private LocalDateTime readAt;
        private String conversationId;
        private LocalDateTime createdAt;

        public ChatMessageBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ChatMessageBuilder sender(User sender) {
            this.sender = sender;
            return this;
        }

        public ChatMessageBuilder recipient(User recipient) {
            this.recipient = recipient;
            return this;
        }

        public ChatMessageBuilder content(String content) {
            this.content = content;
            return this;
        }

        public ChatMessageBuilder messageType(String messageType) {
            this.messageType = messageType;
            return this;
        }

        public ChatMessageBuilder isRead(Boolean isRead) {
            this.isRead = isRead;
            return this;
        }

        public ChatMessageBuilder readAt(LocalDateTime readAt) {
            this.readAt = readAt;
            return this;
        }

        public ChatMessageBuilder conversationId(String conversationId) {
            this.conversationId = conversationId;
            return this;
        }

        public ChatMessageBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ChatMessage build() {
            return new ChatMessage(id, sender, recipient, content, messageType, isRead, readAt, conversationId, createdAt);
        }
    }
}
