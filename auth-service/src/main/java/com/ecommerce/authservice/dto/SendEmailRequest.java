package com.ecommerce.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SendEmailRequest {
    private String recipientEmail;
    private String subject;
    private String message;
}