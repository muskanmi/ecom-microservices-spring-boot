package com.ecommerce.catalogservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddToWishlistRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;
}