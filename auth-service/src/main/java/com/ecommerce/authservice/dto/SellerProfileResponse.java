package com.ecommerce.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SellerProfileResponse {

    private Long id;
    private Long userId;
    private String shopName;
    private String approvalStatus;
    
}
