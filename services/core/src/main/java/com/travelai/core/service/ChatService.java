package com.travelai.core.service;

import com.travelai.core.dto.request.ChatMessageRequest;
import com.travelai.core.dto.response.ChatMessageResponse;
import com.travelai.core.dto.response.ConversationSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatService {

    ChatMessageResponse sendMessage(String senderUsername, ChatMessageRequest request);

    Page<ChatMessageResponse> getConversationHistory(String currentUsername, Long partnerId, Pageable pageable);

    int markConversationAsRead(String currentUsername, Long partnerId);

    List<ConversationSummaryResponse> getUserConversations(String currentUsername);

    long getUnreadMessageCount(String currentUsername);
}
