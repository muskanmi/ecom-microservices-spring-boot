package com.ecommerce.orderservice.dto;

import lombok.Data;

@Data
public class CatalogProductImageResponse {

    private Long id;
    private String imageUrl;
    private Integer displayOrder;
}
