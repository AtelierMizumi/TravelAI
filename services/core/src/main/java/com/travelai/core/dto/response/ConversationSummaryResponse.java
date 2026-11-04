package com.travelai.core.dto.response;

import java.time.LocalDateTime;

public class ConversationSummaryResponse {

    private String conversationId;
    private Long partnerId;
    private String partnerUsername;
    private String partnerFullName;
    private String lastMessage;
    private String lastMessageType;
    private LocalDateTime lastMessageTime;
    private long unreadCount;

    public ConversationSummaryResponse() {
    }

    public ConversationSummaryResponse(String conversationId, Long partnerId, String partnerUsername,
                                       String partnerFullName, String lastMessage, String lastMessageType,
                                       LocalDateTime lastMessageTime, long unreadCount) {
        this.conversationId = conversationId;
        this.partnerId = partnerId;
        this.partnerUsername = partnerUsername;
        this.partnerFullName = partnerFullName;
        this.lastMessage = lastMessage;
        this.lastMessageType = lastMessageType;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
    }

    public String getPartnerUsername() {
        return partnerUsername;
    }

    public void setPartnerUsername(String partnerUsername) {
        this.partnerUsername = partnerUsername;
    }

    public String getPartnerFullName() {
        return partnerFullName;
    }

    public void setPartnerFullName(String partnerFullName) {
        this.partnerFullName = partnerFullName;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public String getLastMessageType() {
        return lastMessageType;
    }

    public void setLastMessageType(String lastMessageType) {
        this.lastMessageType = lastMessageType;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }
}
