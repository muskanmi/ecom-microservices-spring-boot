package com.ecommerce.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @Valid
    @NotNull
    private ShippingAddressRequest shippingAddress;

    // later
    // couponCode
    // giftCard
    // deliveryOption
}
