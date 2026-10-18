
package com.ecommerce.catalogservice.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.catalogservice.dto.CreateProductRequest;
import com.ecommerce.catalogservice.dto.ProductImageResponse;
import com.ecommerce.catalogservice.dto.ProductResponse;
import com.ecommerce.catalogservice.dto.UpdateProductRequest;
import com.ecommerce.catalogservice.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products/internal/seller")
@RequiredArgsConstructor
public class InternalSellerProductController {

    private final ProductService productService;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    // Validate the internal service key.
    private boolean isAuthorized(String serviceKey) {
        return serviceKey != null
                && !serviceKey.isBlank()
                && internalServiceKey != null
                && !internalServiceKey.isBlank()
                && internalServiceKey.equals(serviceKey);
    }

    // Validate seller ID.
    private boolean isValidSellerId(Long sellerId) {
        return sellerId != null && sellerId > 0;
    }

    // Centralized authorization response.
    private ResponseEntity<Void> forbiddenResponse() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // =========================================================
    // GET ALL PRODUCTS BELONGING TO A SELLER
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getSellerProducts(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @RequestParam Long sellerId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId)) {
            return ResponseEntity.badRequest().body("Invalid seller ID.");
        }

        if (minPrice != null && minPrice.signum() < 0
                || maxPrice != null && maxPrice.signum() < 0) {
            return ResponseEntity.badRequest()
                    .body("Prices cannot be negative.");
        }

        if (minPrice != null && maxPrice != null
                && minPrice.compareTo(maxPrice) > 0) {
            return ResponseEntity.badRequest()
                    .body("Minimum price cannot exceed maximum price.");
        }

        return ResponseEntity.ok(
                productService.getSellerProducts(
                        sellerId, category, minPrice, maxPrice));
    }

    // =========================================================
    // GET A SINGLE SELLER PRODUCT
    // =========================================================

    @GetMapping("/{productId}")
    public ResponseEntity<?> getSellerProductById(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @PathVariable Long productId,
            @RequestParam Long sellerId) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId) || productId == null || productId <= 0) {
            return ResponseEntity.badRequest().body("Invalid seller or product ID.");
        }

        return ResponseEntity.ok(
                productService.getSellerProductById(sellerId, productId));
    }

    // =========================================================
    // CREATE SELLER PRODUCT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createSellerProduct(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @RequestParam Long sellerId,
            @Valid @RequestBody CreateProductRequest request) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId)) {
            return ResponseEntity.badRequest().body("Invalid seller ID.");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createSellerProduct(sellerId, request));
    }

    // =========================================================
    // UPDATE SELLER PRODUCT
    // =========================================================

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateSellerProduct(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @PathVariable Long productId,
            @RequestParam Long sellerId,
            @Valid @RequestBody UpdateProductRequest request) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId) || productId == null || productId <= 0) {
            return ResponseEntity.badRequest().body("Invalid seller or product ID.");
        }

        return ResponseEntity.ok(
                productService.updateSellerProduct(sellerId, productId, request));
    }

    // =========================================================
    // DELETE SELLER PRODUCT
    // =========================================================

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteSellerProduct(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @PathVariable Long productId,
            @RequestParam Long sellerId) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId) || productId == null || productId <= 0) {
            return ResponseEntity.badRequest().body("Invalid seller or product ID.");
        }

        productService.deleteSellerProduct(sellerId, productId);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // UPLOAD SELLER PRODUCT IMAGES
    // =========================================================

    @PostMapping(value = "/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadSellerImages(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @PathVariable Long productId,
            @RequestParam Long sellerId,
            @RequestPart("files") List<MultipartFile> files) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId) || productId == null || productId <= 0) {
            return ResponseEntity.badRequest().body("Invalid seller or product ID.");
        }

        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body("At least one image is required.");
        }

        return ResponseEntity.ok(
                productService.uploadSellerImages(sellerId, productId, files));
    }

    // =========================================================
    // UPDATE SELLER PRODUCT IMAGE
    // =========================================================

    @PutMapping(value = "/{productId}/images/{imageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateSellerImage(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestParam Long sellerId,
            @RequestPart("file") MultipartFile file) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId)
                || productId == null || productId <= 0
                || imageId == null || imageId <= 0) {
            return ResponseEntity.badRequest()
                    .body("Invalid seller, product, or image ID.");
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("An image file is required.");
        }

        return ResponseEntity.ok(
                productService.updateSellerImage(
                        sellerId, productId, imageId, file));
    }

    // =========================================================
    // DELETE SELLER PRODUCT IMAGE
    // =========================================================

    @DeleteMapping("/{productId}/images/{imageId}")
    public ResponseEntity<?> deleteSellerImage(
            @RequestHeader(value = "X-Internal-Service-Key", required = false) String serviceKey,
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestParam Long sellerId) {

        if (!isAuthorized(serviceKey)) {
            return forbiddenResponse();
        }

        if (!isValidSellerId(sellerId)
                || productId == null || productId <= 0
                || imageId == null || imageId <= 0) {
            return ResponseEntity.badRequest()
                    .body("Invalid seller, product, or image ID.");
        }

        productService.deleteSellerImage(sellerId, productId, imageId);

        return ResponseEntity.noContent().build();
    }
}
