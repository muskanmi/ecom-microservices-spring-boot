package com.ecommerce.orderservice.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class CatalogProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal mrp;

    private Long categoryId;
    private String categoryName;

    private Long parentCategoryId;
    private String parentCategoryName;

    private Integer stock;
    private Long sellerId;

    private List<CatalogProductImageResponse> images;
}
