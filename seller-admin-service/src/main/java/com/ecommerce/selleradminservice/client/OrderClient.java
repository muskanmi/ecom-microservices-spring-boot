package com.ecommerce.selleradminservice.client;

import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdateShippingInfoRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "order-service", url = "${order.service.url}")
public interface OrderClient {

    @GetMapping("/api/orders/internal/admin")
    List<OrderResponse> getAllOrders(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);

    @GetMapping("/api/orders/internal/admin/{orderId}")
    OrderResponse getOrderById(
            @PathVariable Long orderId,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);

    @PutMapping("/api/orders/internal/{orderId}/shipping")
    OrderResponse updateShippingInfo(
            @PathVariable Long orderId,
            @RequestBody UpdateShippingInfoRequest request,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);

    @PutMapping("/api/orders/internal/{orderId}/status")
    OrderResponse updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);
}