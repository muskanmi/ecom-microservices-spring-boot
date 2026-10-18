package com.ecommerce.authservice.dto;

import java.time.LocalDateTime;

public record AdminCustomerResponse(
        Long id,
        String name,
        String email,
        String avatarUrl,
        LocalDateTime createdAt) {
}