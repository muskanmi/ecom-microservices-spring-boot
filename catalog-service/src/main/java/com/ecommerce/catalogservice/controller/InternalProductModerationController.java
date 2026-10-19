
package com.ecommerce.catalogservice.controller;

import com.ecommerce.catalogservice.dto.ProductResponse;
import com.ecommerce.catalogservice.service.ProductService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/internal/admin")
@RequiredArgsConstructor
public class InternalProductModerationController {

    private final ProductService productService;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @PutMapping("/{productId}/activation")
    public ResponseEntity<Void> updateActivation(
            @PathVariable Long productId,
            @RequestParam boolean active,
            @RequestHeader("X-Internal-Service-Key") String serviceKey) {

        if (internalServiceKey == null
                || internalServiceKey.isBlank()
                || !internalServiceKey.equals(serviceKey)) {
            return ResponseEntity.status(403).build();
        }

        productService.updateProductActivation(productId, active);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProductsForAdmin(
            @RequestHeader("X-Internal-Service-Key") String serviceKey) {

        if (internalServiceKey == null
                || internalServiceKey.isBlank()
                || !internalServiceKey.equals(serviceKey)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(productService.getAllProductsForAdmin());
    }
}
