package com.ecommerce.selleradminservice.dto;

import lombok.Data;

@Data
public class ShippingAddressResponse {

    private String fullName;

    private String phone;

    private String addressLine1;

    private String addressLine2;

    private String city;

    private String state;

    private String pincode;

    private String country;
}