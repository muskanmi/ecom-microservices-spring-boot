package com.ecommerce.catalogservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal mrp;
    private String category;
    private String imageUrl;
    private Integer stock;
    private Long sellerId;
    private LocalDateTime createdAt;
}
