package com.ecommerce.orderservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.orderservice.dto.CreateOrderRequest;
import com.ecommerce.orderservice.dto.OrderResponse;
import com.ecommerce.orderservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.orderservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.orderservice.dto.UpdateShippingInfoRequest;
import com.ecommerce.orderservice.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    @Value("${internal.service.key}")
    private String internalServiceKey;

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateOrderRequest request) {

        return ResponseEntity.ok(
                orderService.createOrder(
                        userId,
                        request));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @RequestHeader("X-User-Id") Long userId) {

        return ResponseEntity.ok(
                orderService.getUserOrders(userId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(
                        orderId,
                        userId));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.cancelOrder(
                        orderId,
                        userId));
    }

    @PutMapping("/internal/{orderId}/payment-status")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @PathVariable Long orderId,
            @RequestBody UpdatePaymentStatusRequest request,
            @RequestHeader("X-Internal-Service-Key") String serviceKey) {

        if (!internalServiceKey.equals(serviceKey)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                orderService.updatePaymentStatus(
                        orderId,
                        request.getPaymentStatus()));
    }

    @PutMapping("/internal/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @RequestHeader("X-Internal-Service-Key") String serviceKey) {

        if (!internalServiceKey.equals(serviceKey)) {
            return ResponseEntity
                    .status(403)
                    .build();
        }

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        orderId,
                        request.getStatus()));
    }

    @PutMapping("/internal/{orderId}/shipping")
    public ResponseEntity<OrderResponse> updateShippingInfo(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateShippingInfoRequest request,
            @RequestHeader("X-Internal-Service-Key") String serviceKey) {

        if (!internalServiceKey.equals(serviceKey)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                orderService.updateShippingInfo(
                        orderId,
                        request));
    }

    @GetMapping("/internal/admin")
    public ResponseEntity<List<OrderResponse>> getAllOrdersForAdmin(
            @RequestHeader("X-Internal-Service-Key") String serviceKey) {

        if (!internalServiceKey.equals(serviceKey)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                orderService.getAllOrdersForAdmin());
    }

    @GetMapping("/internal/admin/{orderId}")
    public ResponseEntity<OrderResponse> getOrderForAdmin(
            @PathVariable Long orderId,
            @RequestHeader("X-Internal-Service-Key") String serviceKey) {

        if (!internalServiceKey.equals(serviceKey)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                orderService.getOrderForAdmin(orderId));
    }
}
