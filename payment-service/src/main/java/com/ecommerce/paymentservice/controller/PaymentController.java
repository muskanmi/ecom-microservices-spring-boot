package com.ecommerce.paymentservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.paymentservice.dto.RazorpayOrderResponse;
import com.ecommerce.paymentservice.dto.RazorpayVerifyRequest;
import com.ecommerce.paymentservice.service.PaymentService;
import com.ecommerce.paymentservice.service.RazorpayPaymentService;
import com.stripe.exception.StripeException;

import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final RazorpayPaymentService razorpayPaymentService;

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

    @PostMapping("/razorpay/order/{orderId}")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            @PathVariable Long orderId,
            @RequestHeader("X-User-Id") Long userId)
            throws com.razorpay.RazorpayException {

        return ResponseEntity.ok(
                razorpayPaymentService.createOrder(orderId, userId));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<Map<String, String>> verifyRazorpayPayment(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody RazorpayVerifyRequest request)
            throws com.razorpay.RazorpayException {

        razorpayPaymentService.verifyPayment(userId, request);

        return ResponseEntity.ok(
                Map.of("status", "PAID"));
    }
}
