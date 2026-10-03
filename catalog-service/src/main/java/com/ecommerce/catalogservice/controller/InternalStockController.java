package com.ecommerce.catalogservice.controller;

import com.ecommerce.catalogservice.dto.StockDeductionRequest;
import com.ecommerce.catalogservice.service.StockService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/internal/stock")
@RequiredArgsConstructor
public class InternalStockController {

    private final StockService stockService;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @PostMapping("/deduct")
    public ResponseEntity<Void> deductStock(
            @RequestHeader("X-Internal-Service-Key") String serviceKey,

            @Valid @RequestBody StockDeductionRequest request) {

        if (!internalServiceKey.equals(serviceKey)) {
            return ResponseEntity
                    .status(403)
                    .build();
        }

        stockService.deductStock(request);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/restore")
    public ResponseEntity<Void> restoreStock(
            @RequestHeader("X-Internal-Service-Key") String serviceKey,
            @RequestBody StockDeductionRequest request) {

        if (!internalServiceKey.equals(serviceKey)) {
            return ResponseEntity.status(403).build();
        }

        stockService.restoreStock(request);

        return ResponseEntity.ok().build();
    }
}