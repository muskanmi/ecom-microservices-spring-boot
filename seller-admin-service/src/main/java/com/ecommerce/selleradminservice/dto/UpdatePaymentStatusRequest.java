package com.ecommerce.selleradminservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePaymentStatusRequest {

    @NotBlank
    private String paymentStatus;
}