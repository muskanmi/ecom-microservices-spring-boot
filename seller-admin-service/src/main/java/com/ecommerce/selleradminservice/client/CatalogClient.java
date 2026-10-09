package com.ecommerce.selleradminservice.client;

import com.ecommerce.selleradminservice.dto.CatalogProductImageResponse;
import com.ecommerce.selleradminservice.dto.CatalogProductResponse;
import com.ecommerce.selleradminservice.dto.CreateProductRequest;
import com.ecommerce.selleradminservice.dto.UpdateProductRequest;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@FeignClient(name = "catalog-service", url = "${catalog.service.url}")
public interface CatalogClient {

    // =========================================================
    // PRODUCTS
    // =========================================================

    @GetMapping("/api/products")
    List<CatalogProductResponse> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice);

    @PostMapping("/api/products")
    CatalogProductResponse createProduct(
            @RequestBody CreateProductRequest request);

    @PutMapping("/api/products/{id}")
    CatalogProductResponse updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request);

    @DeleteMapping("/api/products/{id}")
    void deleteProduct(
            @PathVariable Long id);

    // =========================================================
    // PRODUCT IMAGES
    // =========================================================

    @PostMapping(value = "/api/products/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    List<CatalogProductImageResponse> uploadImages(
            @PathVariable Long id,
            @RequestPart("files") List<MultipartFile> files);

    @PutMapping(value = "/api/products/{id}/images/{imageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    CatalogProductImageResponse updateImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @RequestPart("file") MultipartFile file);

    @DeleteMapping("/api/products/{id}/images/{imageId}")
    void deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId);

    @GetMapping("/api/products/{id}")
    CatalogProductResponse getProductById(
            @PathVariable Long id);
}