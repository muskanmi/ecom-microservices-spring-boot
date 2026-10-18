
package com.ecommerce.authservice.dto;

import java.time.LocalDateTime;

public record AdminSellerResponse(
        Long sellerProfileId,
        Long userId,
        String name,
        String email,
        String shopName,
        String approvalStatus,
        LocalDateTime createdAt) {
}
