package com.ecommerce.orderservice.client;

import com.ecommerce.orderservice.dto.PaymentRefundResponse;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "payment-service", url = "${payment.service.url}")
public interface PaymentClient {

    @PostMapping("/api/payments/internal/{orderId}/refund")
    PaymentRefundResponse refundPayment(
            @PathVariable Long orderId,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);
}