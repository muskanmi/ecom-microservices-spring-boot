package com.ecommerce.notificationservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.notificationservice.dto.SendEmailRequest;
import com.ecommerce.notificationservice.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @RequestHeader("Internal-Service-Key") String providedKey, @Valid @RequestBody SendEmailRequest request) {

        if (!internalServiceKey.equals(providedKey)) {
            return ResponseEntity.status(403).body("Forbidden: invalid service key");
        }

        notificationService.sendEmail(request);

        return ResponseEntity.ok("Email processed");
    }

}
