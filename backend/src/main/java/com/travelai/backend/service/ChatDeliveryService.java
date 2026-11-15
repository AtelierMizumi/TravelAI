package com.travelai.backend.service;

import com.travelai.backend.entity.*;
import com.travelai.backend.repository.*;
import com.travelai.backend.security.SessionService;
import com.travelai.backend.security.MessageEncryption;
import com.travelai.backend.security.MessageCryptography;
import com.travelai.backend.security.VoiceFormat;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
@Transactional
public class ChatDeliveryService {
    private final MessageEncryption encryption;
    private final EntityManager em;
    private final UserRepository users;
    private final ChatMessageRepository messages;
    private final NotificationPublisher notifications;
    private final SimpMessagingTemplate broker;

    public ChatDeliveryService(MessageEncryption encryption, EntityManager em, UserRepository users, ChatMessageRepository messages,
                               NotificationPublisher notifications, SimpMessagingTemplate broker) {
        this.encryption = encryption; this.em = em; this.users = users; this.messages = messages; this.notifications = notifications; this.broker = broker;
    }
    public record ChatView(Long id, String clientMessageId, Long senderId, String senderName, String senderAvatar,
                           Long receiverId, String receiverName, String content, Boolean isRead, LocalDateTime createdAt) {}
    public ChatView view(ChatMessage message) {
        return new ChatView(message.getId(), message.getClientMessageId(), message.getSenderId(), message.getSenderName(),
                message.getSenderAvatar(), message.getReceiverId(), message.getReceiverName(), encryption.read(message),
                message.getIsRead(), message.getCreatedAt());
    }
    public ChatView inboxView(ChatMessage message) {
        ChatView full = view(message);
        if (full.content() == null || !full.content().startsWith(VoiceFormat.PREFIX)) return full;
        return new ChatView(full.id(), full.clientMessageId(), full.senderId(), full.senderName(), full.senderAvatar(),
                full.receiverId(), full.receiverName(), "[Tin nhắn thoại]", full.isRead(), full.createdAt());
    }
    public ChatView send(SessionService.Actor actor, long receiverId, String content, String clientMessageId) {
        if (content == null || content.isBlank() || clientMessageId == null
                || clientMessageId.isBlank() || clientMessageId.length() > 100 || receiverId == actor.id())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid message or retry identifier");
        boolean voice = content.startsWith(VoiceFormat.PREFIX);
        if (voice) VoiceFormat.parse(content);
        else if (content.length() > 10000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is too long");
        User sender = em.find(User.class, actor.id(), LockModeType.PESSIMISTIC_WRITE);
        if (sender == null || !"active".equalsIgnoreCase(sender.getStatus()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account unavailable");
        User receiver = users.findById(receiverId).filter(user -> "active".equalsIgnoreCase(user.getStatus()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient unavailable"));
        String reference = actor.id() + "/" + clientMessageId;
        ChatMessage previous = messages.findByClientMessageId(reference).orElse(null);
        if (previous != null) {
            if (!Objects.equals(encryption.read(previous), content) || previous.getReceiverId() != receiverId)
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Message retry identifier already used");
            return view(previous);
        }
        ChatMessage message = messages.saveAndFlush(ChatMessage.builder().clientMessageId(reference)
                .senderId(sender.getId()).senderName(sender.getName()).senderAvatar(sender.getAvatar())
                .receiverId(receiverId).receiverName(receiver.getName())
                .content(encryption.encrypt(content, sender.getId(), receiverId)).contentEncryption(MessageCryptography.VERSION)
                .isRead(false).createdAt(LocalDateTime.now()).build());
        notifications.save(Notification.builder().userId(receiverId).actorId(sender.getId())
                .actorName(sender.getName()).type("MESSAGE").title("Tin nhắn mới")
                .message(sender.getName() + " đã gửi tin nhắn cho bạn").targetId(sender.getId())
                .isRead(false).createdAt(LocalDateTime.now()).build());
        ChatView response = view(message);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                Object event = voice ? java.util.Map.of("id", response.id(), "type", "VOICE") : response;
                broker.convertAndSend("/topic/messages/" + sender.getId(), event);
                broker.convertAndSend("/topic/messages/" + receiverId, event);
                broker.convertAndSend("/topic/chat-unread/" + receiverId, messages.countByReceiverIdAndIsReadFalse(receiverId));
            }
        });
        return response;
    }
}
