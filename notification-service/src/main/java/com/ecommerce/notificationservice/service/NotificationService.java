package com.ecommerce.notificationservice.service;

import java.time.LocalDateTime;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.ecommerce.notificationservice.dto.SendEmailRequest;
import com.ecommerce.notificationservice.entity.EmailLog;
import com.ecommerce.notificationservice.repository.EmailLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;

    public void sendEmail(SendEmailRequest request) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(request.getRecipientEmail());
        message.setSubject(request.getSubject());
        message.setText(request.getMessage());

        String status;

        try {
            mailSender.send(message);
            status = "SENT";
        } catch (Exception e) {
            status = "FAILED";
        }

        EmailLog emailLog = new EmailLog();
        emailLog.setRecipientEmail(request.getRecipientEmail());
        emailLog.setSubject(request.getSubject());
        emailLog.setStatus(status);
        emailLog.setSentAt(LocalDateTime.now());

        emailLogRepository.save(emailLog);
    }
}
