package com.ecommerce.catalogservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemResponse {

    private Long id;
    private Long productId;
    private ProductResponse product;
}