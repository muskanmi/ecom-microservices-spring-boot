package com.ecommerce.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSellerProfileRequest {
    
    @NotBlank
    private String shopName;
}
