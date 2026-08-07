package com.ecommerce.notificationservice.repository;

import com.ecommerce.notificationservice.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
}