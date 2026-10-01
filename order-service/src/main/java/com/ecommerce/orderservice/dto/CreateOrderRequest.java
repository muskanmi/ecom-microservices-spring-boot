package com.ecommerce.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @Valid
    @NotNull
    private ShippingAddressRequest shippingAddress;

    @NotBlank
    @Email
    private String customerEmail;

    // later
    // couponCode
    // giftCard
    // deliveryOption
}
