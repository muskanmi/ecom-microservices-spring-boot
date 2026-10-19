package com.ecommerce.selleradminservice.client;

import com.ecommerce.selleradminservice.dto.SellerProfileStatusResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "auth-service", url = "${auth.service.url}")
public interface AuthClient {

    @GetMapping("/api/auth/seller-profile")
    SellerProfileStatusResponse getSellerProfile(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization);
}