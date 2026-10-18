
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
    // SELLER PRODUCTS
    // =========================================================

    @GetMapping("/api/products/internal/seller")
    List<CatalogProductResponse> getAllProducts(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @RequestParam("sellerId") Long sellerId,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice);

    @GetMapping("/api/products/internal/seller/{productId}")
    CatalogProductResponse getProductById(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @PathVariable("productId") Long productId,
            @RequestParam("sellerId") Long sellerId);

    @PostMapping("/api/products/internal/seller")
    CatalogProductResponse createProduct(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @RequestParam("sellerId") Long sellerId,
            @RequestBody CreateProductRequest request);

    @PutMapping("/api/products/internal/seller/{productId}")
    CatalogProductResponse updateProduct(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @PathVariable("productId") Long productId,
            @RequestParam("sellerId") Long sellerId,
            @RequestBody UpdateProductRequest request);

    @DeleteMapping("/api/products/internal/seller/{productId}")
    void deleteProduct(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @PathVariable("productId") Long productId,
            @RequestParam("sellerId") Long sellerId);

    // =========================================================
    // SELLER PRODUCT IMAGES
    // =========================================================

    @PostMapping(value = "/api/products/internal/seller/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    List<CatalogProductImageResponse> uploadImages(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @PathVariable("productId") Long productId,
            @RequestParam("sellerId") Long sellerId,
            @RequestPart("files") List<MultipartFile> files);

    @PutMapping(value = "/api/products/internal/seller/{productId}/images/{imageId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    CatalogProductImageResponse updateImage(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @PathVariable("productId") Long productId,
            @PathVariable("imageId") Long imageId,
            @RequestParam("sellerId") Long sellerId,
            @RequestPart("file") MultipartFile file);

    @DeleteMapping("/api/products/internal/seller/{productId}/images/{imageId}")
    void deleteImage(
            @RequestHeader("X-Internal-Service-Key") String internalServiceKey,
            @PathVariable("productId") Long productId,
            @PathVariable("imageId") Long imageId,
            @RequestParam("sellerId") Long sellerId);
}
