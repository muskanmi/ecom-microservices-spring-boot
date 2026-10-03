package com.ecommerce.paymentservice.controller;

import com.ecommerce.paymentservice.dto.RefundPaymentResponse;
import com.ecommerce.paymentservice.service.PaymentRefundService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/internal")
@RequiredArgsConstructor
public class InternalPaymentController {

    private final PaymentRefundService paymentRefundService;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @PostMapping("/{orderId}/refund")
    public ResponseEntity<RefundPaymentResponse> refundPayment(
            @PathVariable Long orderId,
            @RequestHeader("X-Internal-Service-Key") String providedKey) {

        if (!internalServiceKey.equals(providedKey)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                paymentRefundService.refundPayment(orderId));
    }
}