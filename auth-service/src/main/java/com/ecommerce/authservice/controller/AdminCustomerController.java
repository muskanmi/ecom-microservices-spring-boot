package com.ecommerce.authservice.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.authservice.dto.AdminCustomerResponse;
import com.ecommerce.authservice.service.AdminCustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ResponseEntity<List<AdminCustomerResponse>> getAllCustomers() {
        return ResponseEntity.ok(adminCustomerService.getAllCustomers());
    }
}