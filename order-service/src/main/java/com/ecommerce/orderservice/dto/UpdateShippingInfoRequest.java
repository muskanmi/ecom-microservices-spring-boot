package com.ecommerce.orderservice.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateShippingInfoRequest {

    @NotBlank(message = "Carrier is required")
    @Size(max = 100, message = "Carrier must not exceed 100 characters")
    private String carrier;

    @NotBlank(message = "Tracking number is required")
    @Size(max = 100, message = "Tracking number must not exceed 100 characters")
    private String trackingNumber;

    @NotNull(message = "Expected delivery date is required")
    @FutureOrPresent(message = "Expected delivery date cannot be in the past")
    private LocalDate expectedDeliveryDate;
}