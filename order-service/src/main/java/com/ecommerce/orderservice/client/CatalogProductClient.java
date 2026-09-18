package com.ecommerce.orderservice.client;

import com.ecommerce.orderservice.dto.CatalogProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "catalog-service", url = "${catalog.service.url}")
public interface CatalogProductClient {

    @GetMapping("/api/products/{id}")
    CatalogProductResponse getProductById(
            @PathVariable("id") Long productId);
}