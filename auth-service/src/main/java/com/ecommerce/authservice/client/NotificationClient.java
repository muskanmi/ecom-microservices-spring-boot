package com.ecommerce.authservice.client;

import com.ecommerce.authservice.dto.SendEmailRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service", url = "http://localhost:8086")
public interface NotificationClient {

    @PostMapping("/api/notifications/send")
    void sendEmail(@RequestHeader("Internal-Service-Key") String key,
            @RequestBody SendEmailRequest request);
}