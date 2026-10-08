package com.ecommerce.selleradminservice.controller;

import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdateShippingInfoRequest;
import com.ecommerce.selleradminservice.service.SellerAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class SellerAdminController {

    private final SellerAdminService sellerAdminService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                sellerAdminService.getAllOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                sellerAdminService.getOrderById(orderId));
    }

    @PutMapping("/{orderId}/shipping")
    public ResponseEntity<OrderResponse> updateShippingInfo(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateShippingInfoRequest request) {

        return ResponseEntity.ok(
                sellerAdminService.updateShippingInfo(
                        orderId,
                        request));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                sellerAdminService.updateOrderStatus(
                        orderId,
                        request));
    }
}