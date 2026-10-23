package com.ecommerce.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String keyId;
    private String razorpayOrderId;
    private Long amount;
    private String currency;
    private Long localOrderId;
}