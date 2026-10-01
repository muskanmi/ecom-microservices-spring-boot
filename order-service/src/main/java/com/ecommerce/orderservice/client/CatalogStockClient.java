package com.ecommerce.orderservice.client;

import com.ecommerce.orderservice.dto.CatalogStockDeductionRequest;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "catalog-stock-service", url = "${catalog.service.url}")
public interface CatalogStockClient {

    @PostMapping("/api/products/internal/stock/deduct")
    void deductStock(
            @RequestBody CatalogStockDeductionRequest request,

            @RequestHeader("X-Internal-Service-Key") String internalServiceKey);
}