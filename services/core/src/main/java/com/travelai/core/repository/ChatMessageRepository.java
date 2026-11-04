package com.travelai.core.repository;

import com.travelai.core.model.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    long countByRecipientIdAndIsReadFalse(Long recipientId);

    long countByConversationIdAndRecipientIdAndIsReadFalse(String conversationId, Long recipientId);

    Optional<ChatMessage> findFirstByConversationIdOrderByCreatedAtDesc(String conversationId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP " +
           "WHERE m.conversationId = :conversationId AND m.recipient.id = :recipientId AND m.isRead = false")
    int markConversationAsRead(@Param("conversationId") String conversationId, @Param("recipientId") Long recipientId);

    @Query("SELECT DISTINCT m.conversationId FROM ChatMessage m WHERE m.sender.id = :userId OR m.recipient.id = :userId")
    List<String> findDistinctConversationIdsByUserId(@Param("userId") Long userId);
}
