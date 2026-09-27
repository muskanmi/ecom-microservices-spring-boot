package com.ecommerce.paymentservice.controller;

import com.ecommerce.paymentservice.service.PaymentWebhookService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final PaymentWebhookService webhookService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        System.out.println("========== STRIPE WEBHOOK RECEIVED ==========");

        try {

            Event event = Webhook.constructEvent(
                    payload,
                    signature,
                    webhookSecret);

            System.out.println(
                    "Stripe event type: " + event.getType());

            System.out.println(
                    "Stripe event id: " + event.getId());

            webhookService.handleEvent(event);

            return ResponseEntity.ok("received");

        } catch (SignatureVerificationException e) {

            System.err.println(
                    "Stripe webhook signature verification failed");
            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body("Invalid signature");

        } catch (Exception e) {

            System.err.println(
                    "Stripe webhook processing failed");
            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body("Webhook error");
        }
    }
}
