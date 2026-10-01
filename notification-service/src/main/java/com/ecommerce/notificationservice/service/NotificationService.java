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

        System.out.println(
                "========== EMAIL REQUEST ==========");

        System.out.println(
                "Recipient: "
                        + request.getRecipientEmail());

        System.out.println(
                "Subject: "
                        + request.getSubject());

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(
                request.getRecipientEmail());

        message.setSubject(
                request.getSubject());

        message.setText(
                request.getMessage());

        try {

            mailSender.send(message);

            /*
             * ---------------------------------------------
             * SUCCESS
             * ---------------------------------------------
             */

            saveEmailLog(
                    request,
                    "SENT");

            System.out.println(
                    "========== EMAIL SENT ==========");

        } catch (Exception e) {

            /*
             * ---------------------------------------------
             * FAILURE
             * ---------------------------------------------
             */

            saveEmailLog(
                    request,
                    "FAILED");

            System.out.println(
                    "========== EMAIL FAILED ==========");

            System.out.println(
                    "Reason: "
                            + e.getMessage());

            /*
             * For our first test we want the API to
             * clearly tell us that SMTP failed.
             */
            throw new RuntimeException(
                    "Unable to send email",
                    e);
        }
    }

    private void saveEmailLog(
            SendEmailRequest request,
            String status) {

        EmailLog emailLog = new EmailLog();

        emailLog.setRecipientEmail(
                request.getRecipientEmail());

        emailLog.setSubject(
                request.getSubject());

        emailLog.setStatus(
                status);

        emailLog.setSentAt(
                LocalDateTime.now());

        emailLogRepository.save(
                emailLog);
    }
}