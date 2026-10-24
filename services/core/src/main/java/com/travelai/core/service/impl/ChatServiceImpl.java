package com.travelai.core.service.impl;

import com.travelai.core.dto.request.ChatMessageRequest;
import com.travelai.core.dto.response.ChatMessageResponse;
import com.travelai.core.dto.response.ConversationSummaryResponse;
import com.travelai.core.exception.BadRequestException;
import com.travelai.core.exception.ResourceNotFoundException;
import com.travelai.core.model.entity.ChatMessage;
import com.travelai.core.model.entity.User;
import com.travelai.core.repository.ChatMessageRepository;
import com.travelai.core.repository.UserRepository;
import com.travelai.core.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatServiceImpl(
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(String senderUsername, ChatMessageRequest request) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found: " + senderUsername));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found with id: " + request.getRecipientId()));

        if (sender.getId().equals(recipient.getId())) {
            throw new BadRequestException("Không thể gửi tin nhắn cho chính mình.");
        }

        String conversationId = getConversationId(sender.getId(), recipient.getId());

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .recipient(recipient)
                .content(request.getContent().trim())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "CHAT")
                .isRead(false)
                .conversationId(conversationId)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        ChatMessageResponse response = ChatMessageResponse.fromEntity(saved);

        // Real-time broadcast to conversation topic and user queue
        try {
            messagingTemplate.convertAndSend("/topic/conversations." + conversationId, response);
            messagingTemplate.convertAndSendToUser(recipient.getUsername(), "/queue/messages", response);
        } catch (Exception e) {
            log.warn("Failed to dispatch WebSocket message: {}", e.getMessage());
        }

        log.info("Sent chat message id={} from={} to={} conv={}", saved.getId(), senderUsername, recipient.getUsername(), conversationId);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getConversationHistory(String currentUsername, Long partnerId, Pageable pageable) {
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner user not found with id: " + partnerId));

        String conversationId = getConversationId(current.getId(), partnerId);
        return chatMessageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable)
                .map(ChatMessageResponse::fromEntity);
    }

    @Override
    @Transactional
    public int markConversationAsRead(String currentUsername, Long partnerId) {
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        String conversationId = getConversationId(current.getId(), partnerId);
        int updated = chatMessageRepository.markConversationAsRead(conversationId, current.getId());
        log.info("Marked {} messages as read in conversation {} for user {}", updated, conversationId, currentUsername);
        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryResponse> getUserConversations(String currentUsername) {
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        List<String> conversationIds = chatMessageRepository.findDistinctConversationIdsByUserId(current.getId());
        List<ConversationSummaryResponse> summaries = new ArrayList<>();

        for (String convId : conversationIds) {
            chatMessageRepository.findFirstByConversationIdOrderByCreatedAtDesc(convId).ifPresent(lastMsg -> {
                User partner = lastMsg.getSender().getId().equals(current.getId())
                        ? lastMsg.getRecipient()
                        : lastMsg.getSender();

                long unreadCount = chatMessageRepository.countByConversationIdAndRecipientIdAndIsReadFalse(convId, current.getId());

                summaries.add(new ConversationSummaryResponse(
                        convId,
                        partner.getId(),
                        partner.getUsername(),
                        partner.getFullName(),
                        lastMsg.getContent(),
                        lastMsg.getMessageType(),
                        lastMsg.getCreatedAt(),
                        unreadCount
                ));
            });
        }

        summaries.sort(Comparator.comparing(ConversationSummaryResponse::getLastMessageTime, Comparator.nullsLast(Comparator.reverseOrder())));
        return summaries;
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadMessageCount(String currentUsername) {
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        return chatMessageRepository.countByRecipientIdAndIsReadFalse(current.getId());
    }

    private String getConversationId(Long id1, Long id2) {
        return Math.min(id1, id2) + "_" + Math.max(id1, id2);
    }
}
