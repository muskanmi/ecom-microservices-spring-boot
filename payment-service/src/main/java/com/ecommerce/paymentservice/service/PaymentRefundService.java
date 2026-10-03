package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.dto.RefundPaymentResponse;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentRefundService {

    private final PaymentRepository paymentRepository;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Transactional
    public RefundPaymentResponse refundPayment(Long orderId) {

        System.out.println(
                "===== CUSTOMER PAYMENT REFUND =====");

        System.out.println(
                "Order ID: " + orderId);

        Payment payment = paymentRepository
                .findFirstByOrderIdAndStatusOrderByCreatedAtDesc(
                        orderId,
                        "PAID")
                .orElseThrow(() -> new RuntimeException(
                        "No PAID payment found for order: "
                                + orderId));

        /*
         * Idempotency protection.
         *
         * If Stripe refund was already completed and the payment
         * was already marked REFUNDED, the method above will not find
         * it because we searched for PAID.
         *
         * So the controller/service integration should normally call
         * this only once for a PAID payment.
         */

        if (payment.getStripeRefundId() != null) {

            System.out.println(
                    "Payment already has a Stripe refund: "
                            + payment.getStripeRefundId());

            return buildResponse(payment);
        }

        if (payment.getStripePaymentIntentId() == null
                || payment.getStripePaymentIntentId().isBlank()) {

            throw new RuntimeException(
                    "Stripe PaymentIntent ID is missing for order: "
                            + orderId);
        }

        try {

            System.out.println(
                    "Stripe PaymentIntent: "
                            + payment.getStripePaymentIntentId());

            RequestOptions requestOptions = RequestOptions.builder()
                    .setApiKey(stripeSecretKey)
                    .setIdempotencyKey(
                            "refund-order-" + orderId)
                    .build();

            Refund refund = Refund.create(
                    com.stripe.param.RefundCreateParams.builder()
                            .setPaymentIntent(
                                    payment.getStripePaymentIntentId())
                            .build(),
                    requestOptions);

            payment.setStripeRefundId(
                    refund.getId());

            payment.setStatus(
                    "REFUNDED");

            paymentRepository.save(payment);

            System.out.println(
                    "Stripe refund successful");

            System.out.println(
                    "Stripe Refund ID: "
                            + refund.getId());

            System.out.println(
                    "Payment status: "
                            + payment.getStatus());

            return buildResponse(payment);

        } catch (StripeException e) {

            System.out.println(
                    "Stripe refund failed");

            throw new RuntimeException(
                    "Stripe refund failed for order: "
                            + orderId,
                    e);
        }
    }

    private RefundPaymentResponse buildResponse(
            Payment payment) {

        return RefundPaymentResponse.builder()
                .orderId(payment.getOrderId())
                .paymentId(payment.getId())
                .paymentStatus(
                        payment.getStatus())
                .stripeRefundId(
                        payment.getStripeRefundId())
                .amount(payment.getAmount())
                .build();
    }
}