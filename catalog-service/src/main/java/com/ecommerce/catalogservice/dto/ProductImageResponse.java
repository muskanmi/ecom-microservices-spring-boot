package com.ecommerce.catalogservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class ProductImageResponse {

    private Long id;
    private String imageUrl;
    private Integer displayOrder;
}
