package com.ecommerce.selleradminservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CatalogProductResponse {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private BigDecimal mrp;

    private Integer stock;

    private Long sellerId;

    private LocalDateTime createdAt;

    private Long categoryId;

    private String categoryName;

    private Long parentCategoryId;

    private String parentCategoryName;

    private List<CatalogProductImageResponse> images;
}