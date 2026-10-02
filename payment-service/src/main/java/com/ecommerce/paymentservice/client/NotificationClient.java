package com.ecommerce.paymentservice.client;

import com.ecommerce.paymentservice.dto.SendEmailRequest;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationClient {

    @PostMapping("/api/notifications/send")
    String sendEmail(
            @RequestHeader("Internal-Service-Key") String internalServiceKey,

            @RequestBody SendEmailRequest request);
}