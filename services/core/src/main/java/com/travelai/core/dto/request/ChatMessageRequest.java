package com.travelai.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatMessageRequest {

    @NotNull(message = "ID người nhận không được để trống")
    private Long recipientId;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;

    private String messageType = "CHAT"; // "CHAT", "JOIN", "LEAVE", "ITINERARY_SHARE"

    public ChatMessageRequest() {
    }

    public ChatMessageRequest(Long recipientId, String content, String messageType) {
        this.recipientId = recipientId;
        this.content = content;
        this.messageType = messageType != null ? messageType : "CHAT";
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
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
}
