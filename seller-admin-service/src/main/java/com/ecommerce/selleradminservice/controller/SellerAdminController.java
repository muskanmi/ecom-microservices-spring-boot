package com.ecommerce.selleradminservice.controller;

import com.ecommerce.selleradminservice.dto.CatalogProductResponse;
import com.ecommerce.selleradminservice.dto.CreateProductRequest;
import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdateProductRequest;
import com.ecommerce.selleradminservice.dto.UpdateShippingInfoRequest;
import com.ecommerce.selleradminservice.service.SellerAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class SellerAdminController {

    private final SellerAdminService sellerAdminService;

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                sellerAdminService.getAllOrders());
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                sellerAdminService.getOrderById(orderId));
    }

    @PutMapping("/orders/{orderId}/shipping")
    public ResponseEntity<OrderResponse> updateShippingInfo(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateShippingInfoRequest request) {

        return ResponseEntity.ok(
                sellerAdminService.updateShippingInfo(
                        orderId,
                        request));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                sellerAdminService.updateOrderStatus(
                        orderId,
                        request));
    }

    @GetMapping("/products")
    public ResponseEntity<List<CatalogProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        return ResponseEntity.ok(
                sellerAdminService.getAllProducts(
                        category,
                        minPrice,
                        maxPrice));
    }

    @PostMapping("/products")
    public ResponseEntity<CatalogProductResponse> createProduct(
            @RequestBody CreateProductRequest request) {

        return ResponseEntity.ok(
                sellerAdminService.createProduct(request));
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<CatalogProductResponse> updateProduct(
            @PathVariable Long productId,
            @RequestBody UpdateProductRequest request) {

        return ResponseEntity.ok(
                sellerAdminService.updateProduct(
                        productId,
                        request));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId) {

        sellerAdminService.deleteProduct(productId);

        return ResponseEntity.noContent().build();
    }
}