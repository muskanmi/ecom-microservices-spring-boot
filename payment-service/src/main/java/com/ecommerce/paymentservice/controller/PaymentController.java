package com.ecommerce.paymentservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.paymentservice.service.PaymentService;
import com.stripe.exception.StripeException;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout-session/{orderId}")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            @PathVariable Long orderId,
            @RequestHeader("X-User-Id") Long userId) throws StripeException {

        String checkoutUrl = paymentService.createCheckoutSession(
                orderId,
                userId);

        return ResponseEntity.ok(
                Map.of(
                        "checkoutUrl",
                        checkoutUrl));
    }
}
