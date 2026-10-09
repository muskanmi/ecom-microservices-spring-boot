package com.ecommerce.selleradminservice.controller;

import com.ecommerce.selleradminservice.dto.CatalogProductImageResponse;
import com.ecommerce.selleradminservice.dto.CatalogProductResponse;
import com.ecommerce.selleradminservice.dto.CreateProductRequest;
import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdateProductRequest;
import com.ecommerce.selleradminservice.dto.UpdateShippingInfoRequest;
import com.ecommerce.selleradminservice.service.SellerAdminService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class SellerAdminController {

    private final SellerAdminService sellerAdminService;

    // =========================================================
    // ORDERS
    // =========================================================

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

    // =========================================================
    // PRODUCTS
    // =========================================================

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

    // =========================================================
    // PRODUCT IMAGES
    // =========================================================

    @PostMapping(value = "/products/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<CatalogProductImageResponse>> uploadProductImages(
            @PathVariable Long productId,
            @RequestPart("files") List<MultipartFile> files) {

        return ResponseEntity.ok(
                sellerAdminService.uploadProductImages(
                        productId,
                        files));
    }

    @PutMapping(value = "/products/{productId}/images/{imageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CatalogProductImageResponse> updateProductImage(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestPart("file") MultipartFile file) {

        return ResponseEntity.ok(
                sellerAdminService.updateProductImage(
                        productId,
                        imageId,
                        file));
    }

    @DeleteMapping("/products/{productId}/images/{imageId}")
    public ResponseEntity<Void> deleteProductImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {

        sellerAdminService.deleteProductImage(
                productId,
                imageId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<CatalogProductResponse> getProductById(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                sellerAdminService.getProductById(productId));
    }
}