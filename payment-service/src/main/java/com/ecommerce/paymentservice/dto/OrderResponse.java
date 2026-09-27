package com.ecommerce.paymentservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderResponse {

    private Long id;

    private Long userId;

    private String orderNumber;

    private BigDecimal subtotal;

    private BigDecimal discount;

    private BigDecimal shippingFee;

    private BigDecimal totalAmount;

    private String status;

    private String paymentStatus;

    private List<OrderItemResponse> items;
}