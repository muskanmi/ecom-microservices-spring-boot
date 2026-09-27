package com.ecommerce.paymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.UpdatePaymentStatusRequest;

@FeignClient(name = "order-service", url = "${order.service.url}")
public interface OrderClient {

    @GetMapping("/api/orders/{orderId}")
    OrderResponse getOrderById(
            @PathVariable Long orderId,
            @RequestHeader("X-User-Id") Long userId);

    @PutMapping("/api/orders/internal/{orderId}/payment-status")
    OrderResponse updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestBody UpdatePaymentStatusRequest request,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);
}
