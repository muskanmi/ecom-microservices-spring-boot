package com.ecommerce.selleradminservice.client;

import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdatePaymentStatusRequest;
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

    @PutMapping("api/orders/internal/{orderId}/payment-status")
    OrderResponse updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestBody UpdatePaymentStatusRequest request,
            @RequestHeader("X-Internal-Service-Key") String serviceKey);

    @GetMapping("/api/orders/internal/seller")
    List<OrderResponse> getOrdersForSeller(
            @RequestParam("sellerId") Long sellerId,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);

    @GetMapping("/api/orders/internal/seller/{orderId}")
    OrderResponse getOrderForSeller(
            @PathVariable("orderId") Long orderId,
            @RequestParam("sellerId") Long sellerId,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);

    @PutMapping("/api/orders/internal/seller/{orderId}/status")
    OrderResponse updateOrderStatusForSeller(
            @PathVariable("orderId") Long orderId,
            @RequestParam("sellerId") Long sellerId,
            @RequestBody UpdateOrderStatusRequest request,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);

    @PutMapping("/api/orders/internal/seller/{orderId}/shipping")
    OrderResponse updateShippingInfoForSeller(
            @PathVariable("orderId") Long orderId,
            @RequestParam("sellerId") Long sellerId,
            @RequestBody UpdateShippingInfoRequest request,
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);
}