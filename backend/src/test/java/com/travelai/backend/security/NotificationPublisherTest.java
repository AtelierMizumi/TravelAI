package com.travelai.backend.security;

import com.travelai.backend.entity.Notification;
import com.travelai.backend.repository.NotificationRepository;
import com.travelai.backend.service.NotificationPublisher;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import static org.mockito.Mockito.*;

class NotificationPublisherTest {
    @Test void eventIsSentOnlyAfterTheTransactionCommits() {
        NotificationRepository repository = mock(NotificationRepository.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);
        Notification notification = Notification.builder().id(1L).userId(7L).build();
        when(repository.save(notification)).thenReturn(notification);
        NotificationPublisher publisher = new NotificationPublisher(repository, broker);
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            publisher.save(notification);
            verifyNoInteractions(broker);
            TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCommit());
            verify(broker).convertAndSend("/topic/notifications/7", notification);
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
            TransactionSynchronizationManager.setActualTransactionActive(false);
        }
    }
    @Test void administratorNotificationUsesProtectedChannel() {
        NotificationRepository repository = mock(NotificationRepository.class);
        SimpMessagingTemplate broker = mock(SimpMessagingTemplate.class);
        Notification notification = Notification.builder().id(2L).userId(0L).build();
        new NotificationPublisher(repository, broker).changed(notification);
        verify(broker).convertAndSend("/topic/admin-notifications", notification);
    }
}
