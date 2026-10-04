package com.ecommerce.paymentservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendEmailRequest {

    @NotBlank
    @Email
    private String recipientEmail;

    @NotBlank
    private String subject;

    @NotBlank
    private String message;
}