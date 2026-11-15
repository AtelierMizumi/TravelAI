package com.travelai.backend.repository;

import com.travelai.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    java.util.Optional<ChatMessage> findByClientMessageId(String clientMessageId);
    java.util.List<ChatMessage> findBySenderIdOrReceiverIdOrderByCreatedAtDesc(Long senderId, Long receiverId);

    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
            Long senderId,
            Long receiverId,
            Long receiverId2,
            Long senderId2
    );

    List<ChatMessage> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    Long countByReceiverIdAndIsReadFalse(Long receiverId);
}