
package com.ecommerce.authservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.authservice.dto.AdminSellerResponse;
import com.ecommerce.authservice.service.AdminSellerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/sellers")
@RequiredArgsConstructor
public class AdminSellerController {

    private final AdminSellerService adminSellerService;

    @GetMapping
    public ResponseEntity<List<AdminSellerResponse>> getAllSellers() {
        return ResponseEntity.ok(
                adminSellerService.getAllSellers());
    }

    @PutMapping("/{sellerProfileId}/approval")
    public ResponseEntity<AdminSellerResponse> updateApprovalStatus(
            @PathVariable Long sellerProfileId,
            @RequestBody Map<String, String> request) {

        return ResponseEntity.ok(
                adminSellerService.updateApprovalStatus(
                        sellerProfileId,
                        request.get("status")));
    }
}
