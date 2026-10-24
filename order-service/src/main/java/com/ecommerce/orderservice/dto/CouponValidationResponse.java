package com.ecommerce.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CouponValidationResponse {

    private String code;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private String message;
}