package com.ecommerce.selleradminservice.client;

import com.ecommerce.selleradminservice.dto.CatalogProductResponse;
import com.ecommerce.selleradminservice.dto.CreateProductRequest;
import com.ecommerce.selleradminservice.dto.UpdateProductRequest;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.List;

@FeignClient(name = "catalog-service", url = "${catalog.service.url}")
public interface CatalogClient {

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
}