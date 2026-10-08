package com.ecommerce.selleradminservice.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProductRequest {

    private String name;

    private String description;

    private BigDecimal price;

    private BigDecimal mrp;

    private Integer stock;

    private Long categoryId;
}