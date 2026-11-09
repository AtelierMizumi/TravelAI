package com.travelai.backend.repository;

import com.travelai.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    Long countByUserIdAndIsReadFalse(Long userId);

    List<Notification> findByTargetReferenceAndTypeStartingWith(String targetReference, String type);
}