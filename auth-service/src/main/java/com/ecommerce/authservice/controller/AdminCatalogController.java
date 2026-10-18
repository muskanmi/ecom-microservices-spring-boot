package com.ecommerce.authservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
}