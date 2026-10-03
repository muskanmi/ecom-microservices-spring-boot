package com.ecommerce.orderservice.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRefundResponse {

    private Long orderId;
    private Long paymentId;
    private String paymentStatus;
    private String stripeRefundId;
    private BigDecimal amount;
}