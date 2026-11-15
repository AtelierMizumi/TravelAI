package com.travelai.backend.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {

    private Long senderId;
    private String senderName;
    private String senderAvatar;

    private Long receiverId;
    private String receiverName;

    private String content;
}