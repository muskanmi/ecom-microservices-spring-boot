package com.ecommerce.selleradminservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {

    private Long id;

    private Long userId;

    private String customerEmail;

    private String orderNumber;

    private BigDecimal subtotal;

    private BigDecimal discount;

    private BigDecimal shippingFee;

    private BigDecimal totalAmount;

    private String status;

    private String paymentStatus;

    private String carrier;

    private String trackingNumber;

    private LocalDate expectedDeliveryDate;

    private ShippingAddressResponse shippingAddress;

    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
}