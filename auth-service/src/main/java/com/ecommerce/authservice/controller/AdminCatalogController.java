
package com.ecommerce.authservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.authservice.service.AdminCatalogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/catalog")
@RequiredArgsConstructor
public class AdminCatalogController {

    private final AdminCatalogService adminCatalogService;

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getAllProducts() {
        return ResponseEntity.ok(adminCatalogService.getAllProducts());
    }

    @PutMapping("/products/{productId}/activation")
    public ResponseEntity<Void> updateProductActivation(
            @PathVariable Long productId,
            @RequestParam boolean active) {

        adminCatalogService.updateProductActivation(productId, active);

        return ResponseEntity.noContent().build();
    }
}
