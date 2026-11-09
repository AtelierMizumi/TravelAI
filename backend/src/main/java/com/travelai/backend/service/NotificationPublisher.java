package com.travelai.backend.service;

import com.travelai.backend.entity.Notification;
import com.travelai.backend.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class NotificationPublisher {
    private static final Logger logger = LoggerFactory.getLogger(NotificationPublisher.class);
    private final NotificationRepository repository;
    private final SimpMessagingTemplate broker;

    public NotificationPublisher(NotificationRepository repository, SimpMessagingTemplate broker) {
        this.repository = repository;
        this.broker = broker;
    }

    @Transactional
    public Notification save(Notification notification) {
        Notification saved = repository.save(notification);
        changed(saved);
        return saved;
    }

    @Transactional
    public void supersedeReminders(String bookingId) {
        var reminders = repository.findByTargetReferenceAndTypeStartingWith(bookingId, "REMINDER_").stream()
                .filter(notification -> !"REMINDER_SUPERSEDED".equals(notification.getType())).toList();
        for (Notification reminder : reminders) {
            reminder.setType("REMINDER_SUPERSEDED");
            reminder.setTitle("Lời nhắc lịch cũ");
            reminder.setMessage("Lịch trình đã được cập nhật hoặc hủy. Vui lòng xem chi tiết đặt chỗ.");
            reminder.setIsRead(true);
        }
        repository.saveAll(reminders);
        if (!reminders.isEmpty()) changed(reminders.get(0));
    }

    public void changed(Notification notification) {
        String destination = Long.valueOf(0).equals(notification.getUserId())
                ? "/topic/admin-notifications" : "/topic/notifications/" + notification.getUserId();
        afterCommit(destination, notification);
    }

    public void feedChanged() {
        afterCommit("/topic/feed", java.util.Map.of("changed", true));
    }

    public void inventoryChanged(String offeringId) {
        afterCommit("/topic/inventory/" + offeringId, java.util.Map.of("changed", true));
    }

    private void afterCommit(String destination, Object payload) {
        Runnable publish = () -> {
            try {
                broker.convertAndSend(destination, payload);
            } catch (RuntimeException error) {
                logger.warn("Could not publish realtime event; clients can refresh");
            }
        };
        if (TransactionSynchronizationManager.isActualTransactionActive()
                && TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { publish.run(); }
            });
        } else {
            publish.run();
        }
    }
}
