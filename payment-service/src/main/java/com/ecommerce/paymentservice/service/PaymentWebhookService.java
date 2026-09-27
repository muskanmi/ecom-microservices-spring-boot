package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentWebhookService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    public void handleEvent(Event event) {

        switch (event.getType()) {

            case "checkout.session.completed" ->
                handleCheckoutCompleted(event);

            case "checkout.session.expired" ->
                handleCheckoutExpired(event);

            default ->
                System.out.println(
                        "Unhandled Stripe event: "
                                + event.getType());
        }
    }

    private void handleCheckoutCompleted(
            Event event) {

        Session session = (Session) event
                .getDataObjectDeserializer()
                .getObject()
                .orElseThrow();

        Payment payment = paymentRepository
                .findByStripeSessionId(
                        session.getId())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Payment not found"));

        // Stripe webhook can be delivered more than once
        if ("PAID".equals(payment.getStatus())) {
            return;
        }

        payment.setStatus("PAID");

        payment.setStripePaymentIntentId(
                session.getPaymentIntent());

        paymentRepository.save(payment);

        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();

        request.setPaymentStatus("PAID");

        orderClient.updatePaymentStatus(
                payment.getOrderId(),
                request,
                internalServiceKey);
    }

    private void handleCheckoutExpired(
            Event event) {

        Session session = (Session) event
                .getDataObjectDeserializer()
                .getObject()
                .orElseThrow();

        paymentRepository
                .findByStripeSessionId(
                        session.getId())
                .ifPresent(payment -> {

                    if (!"PAID".equals(
                            payment.getStatus())) {
                        payment.setStatus(
                                "CANCELLED");

                        paymentRepository.save(
                                payment);
                    }
                });
    }
}
