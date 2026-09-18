package com.ecommerce.orderservice.dto;

import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CartDetailsResponse {

    private Long cartId;
    private Long userId;
    private List<CartItemDetailResponse> items;
}
