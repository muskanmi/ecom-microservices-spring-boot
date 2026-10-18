
package com.ecommerce.catalogservice.controller;

import java.math.BigDecimal;
import java.util.List;

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
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // =========================================================
    // PUBLIC CUSTOMER PRODUCT CATALOGUE
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        return ResponseEntity.ok(
                productService.getAllProducts(category, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(productService.getProductById(id));
    }

    // =========================================================
    // PRODUCT WRITE OPERATIONS
    // Disabled on public endpoints.
    // Use seller-admin-service for seller product management.
    // =========================================================

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // =========================================================
    // PRODUCT IMAGE OPERATIONS
    // Disabled on public endpoints.
    // Use seller-admin-service for seller image management.
    // =========================================================

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ProductImageResponse>> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping(value = "/{id}/images/{imageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageResponse> updateImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @RequestPart("file") MultipartFile file) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
