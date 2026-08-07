package com.ecommerce.notificationservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendEmailRequest {

    @NotBlank
    @Email
    private String recipientEmail;

    private String subject;

    private String message;
}
