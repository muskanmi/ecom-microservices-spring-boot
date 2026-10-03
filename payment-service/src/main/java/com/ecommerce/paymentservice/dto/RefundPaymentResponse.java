package com.ecommerce.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundPaymentResponse {

    private Long orderId;
    private Long paymentId;
    private String paymentStatus;
    private String stripeRefundId;
    private BigDecimal amount;
}