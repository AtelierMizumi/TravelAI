package com.travelai.core.dto.response;

import com.travelai.core.model.entity.ChatMessage;
import java.time.LocalDateTime;

public class ChatMessageResponse {

    private Long id;
    private Long senderId;
    private String senderUsername;
    private String senderFullName;
    private Long recipientId;
    private String recipientUsername;
    private String recipientFullName;
    private String content;
    private String messageType;
    private Boolean isRead;
    private LocalDateTime readAt;
    private String conversationId;
    private LocalDateTime createdAt;

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(Long id, Long senderId, String senderUsername, String senderFullName,
                               Long recipientId, String recipientUsername, String recipientFullName,
                               String content, String messageType, Boolean isRead, LocalDateTime readAt,
                               String conversationId, LocalDateTime createdAt) {
        this.id = id;
        this.senderId = senderId;
        this.senderUsername = senderUsername;
        this.senderFullName = senderFullName;
        this.recipientId = recipientId;
        this.recipientUsername = recipientUsername;
        this.recipientFullName = recipientFullName;
        this.content = content;
        this.messageType = messageType;
        this.isRead = isRead;
        this.readAt = readAt;
        this.conversationId = conversationId;
        this.createdAt = createdAt;
    }

    public static ChatMessageResponse fromEntity(ChatMessage msg) {
        if (msg == null) {
            return null;
        }

        Long sId = msg.getSender() != null ? msg.getSender().getId() : null;
        String sUser = msg.getSender() != null ? msg.getSender().getUsername() : null;
        String sName = msg.getSender() != null ? msg.getSender().getFullName() : null;

        Long rId = msg.getRecipient() != null ? msg.getRecipient().getId() : null;
        String rUser = msg.getRecipient() != null ? msg.getRecipient().getUsername() : null;
        String rName = msg.getRecipient() != null ? msg.getRecipient().getFullName() : null;

        return new ChatMessageResponse(
                msg.getId(),
                sId,
                sUser,
                sName,
                rId,
                rUser,
                rName,
                msg.getContent(),
                msg.getMessageType(),
                msg.getIsRead(),
                msg.getReadAt(),
                msg.getConversationId(),
                msg.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getSenderFullName() {
        return senderFullName;
    }

    public void setSenderFullName(String senderFullName) {
        this.senderFullName = senderFullName;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientUsername() {
        return recipientUsername;
    }

    public void setRecipientUsername(String recipientUsername) {
        this.recipientUsername = recipientUsername;
    }

    public String getRecipientFullName() {
        return recipientFullName;
    }

    public void setRecipientFullName(String recipientFullName) {
        this.recipientFullName = recipientFullName;
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
}
