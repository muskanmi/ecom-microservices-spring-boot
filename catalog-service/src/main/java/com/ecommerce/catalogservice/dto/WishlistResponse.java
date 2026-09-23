package com.ecommerce.catalogservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {

    private Long wishlistId;
    private Long userId;
    private List<WishlistItemResponse> items;
}