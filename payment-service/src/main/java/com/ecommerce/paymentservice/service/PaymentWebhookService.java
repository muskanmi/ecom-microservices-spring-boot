package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentWebhookService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    public void handleEvent(Event event) {

        System.out.println(
                "Handling Stripe event: " + event.getType());

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

    private void handleCheckoutCompleted(Event event) {

        System.out.println(
                "========== CHECKOUT SESSION COMPLETED ==========");

        Session session = (Session) event
                .getDataObjectDeserializer()
                .getObject()
                .orElseThrow(
                        () -> new RuntimeException(
                                "Unable to deserialize Checkout Session"));

        System.out.println(
                "Stripe session ID: " + session.getId());

        Payment payment = paymentRepository
                .findByStripeSessionId(session.getId())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Payment not found for Stripe session: "
                                        + session.getId()));

        System.out.println(
                "Found payment ID: " + payment.getId());

        /*
         * Check whether this is still the latest
         * payment attempt for this order.
         */
        List<Payment> attempts = paymentRepository
                .findByOrderIdOrderByCreatedAtDesc(
                        payment.getOrderId());

        if (!attempts.isEmpty()) {

            Payment latestPayment = attempts.get(0);

            if (!latestPayment.getId().equals(
                    payment.getId())) {

                System.out.println(
                        "Ignoring old Stripe payment attempt: "
                                + payment.getId());

                return;
            }
        }

        /*
         * Idempotency:
         * Stripe may send the same event more than once.
         */
        if ("PAID".equals(payment.getStatus())) {

            System.out.println(
                    "Payment already PAID. Skipping.");

            return;
        }

        payment.setStatus("PAID");

        payment.setStripePaymentIntentId(
                session.getPaymentIntent());

        paymentRepository.save(payment);

        System.out.println(
                "Payment updated to PAID");

        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();

        request.setPaymentStatus("PAID");

        OrderResponse orderResponse = orderClient.updatePaymentStatus(
                payment.getOrderId(),
                request,
                internalServiceKey);

        System.out.println(
                "Order updated after payment: "
                        + orderResponse.getOrderNumber());

        System.out.println(
                "========== CHECKOUT SESSION HANDLED ==========");
    }

    private void handleCheckoutExpired(Event event) {

        System.out.println(
                "========== CHECKOUT SESSION EXPIRED ==========");

        Session session = (Session) event
                .getDataObjectDeserializer()
                .getObject()
                .orElseThrow(
                        () -> new RuntimeException(
                                "Unable to deserialize Checkout Session"));

        Payment payment = paymentRepository
                .findByStripeSessionId(session.getId())
                .orElse(null);

        if (payment == null) {

            System.out.println(
                    "Payment not found for expired session: "
                            + session.getId());

            return;
        }

        if ("PAID".equals(payment.getStatus())) {

            System.out.println(
                    "Payment already PAID. Ignoring expiration.");

            return;
        }

        payment.setStatus("CANCELLED");

        paymentRepository.save(payment);

        /*
         * Check if this is the latest payment attempt.
         *
         * If the user already created a newer Stripe
         * session for the same order, don't cancel
         * the order because of the old session.
         */
        List<Payment> attempts = paymentRepository
                .findByOrderIdOrderByCreatedAtDesc(
                        payment.getOrderId());

        if (!attempts.isEmpty()) {

            Payment latestPayment = attempts.get(0);

            if (!latestPayment.getId().equals(
                    payment.getId())) {

                System.out.println(
                        "Old payment attempt expired. "
                                + "Order remains active.");

                return;
            }
        }

        /*
         * This was the latest payment attempt,
         * so cancel the order as well.
         */
        UpdatePaymentStatusRequest request = new UpdatePaymentStatusRequest();

        request.setPaymentStatus("CANCELLED");

        orderClient.updatePaymentStatus(
                payment.getOrderId(),
                request,
                internalServiceKey);

        System.out.println(
                "Order cancelled because latest "
                        + "Stripe session expired.");

        System.out.println(
                "========== CHECKOUT SESSION EXPIRATION HANDLED ==========");
    }
}