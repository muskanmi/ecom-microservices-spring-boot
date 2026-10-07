package com.ecommerce.orderservice.client;

import com.ecommerce.orderservice.dto.SendEmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationClient {

    @PostMapping("/api/notifications/send")
    String sendEmail(
            @RequestHeader("Internal-Service-Key") String internalServiceKey,

            @RequestBody SendEmailRequest request);
}