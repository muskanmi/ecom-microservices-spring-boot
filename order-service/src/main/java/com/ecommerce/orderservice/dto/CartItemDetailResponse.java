package com.ecommerce.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDetailResponse {

    private Long id;
    private Long productId;
    private Integer quantity;
    private CatalogProductResponse product;
}
