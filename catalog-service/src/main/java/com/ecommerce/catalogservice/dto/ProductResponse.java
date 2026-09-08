package com.ecommerce.catalogservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal mrp;
    private String category;
    private List<ProductImageResponse> images;
    private Integer stock;
    private Long sellerId;
    private LocalDateTime createdAt;
}
