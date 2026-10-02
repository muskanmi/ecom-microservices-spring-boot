package com.ecommerce.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendEmailRequest {

    private String recipientEmail;

    private String subject;

    private String message;
}