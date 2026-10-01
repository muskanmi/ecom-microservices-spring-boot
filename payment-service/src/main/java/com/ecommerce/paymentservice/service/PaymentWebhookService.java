package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.RefundCreateParams;
import feign.FeignException;
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

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

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

        System.out.println(
                "Stripe payment intent ID: "
                        + session.getPaymentIntent());

        Payment payment = paymentRepository
                .findByStripeSessionId(
                        session.getId())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Payment not found for Stripe session: "
                                        + session.getId()));

        System.out.println(
                "Found payment ID: "
                        + payment.getId());

        System.out.println(
                "Order ID: "
                        + payment.getOrderId());

        /*
         * -----------------------------------------------------
         * CURRENT PAYMENT STATUS
         * -----------------------------------------------------
         */

        System.out.println(
                "Current payment status: "
                        + payment.getStatus());

        /*
         * -----------------------------------------------------
         * SAVE STRIPE PAYMENT INTENT
         * -----------------------------------------------------
         *
         * Save this BEFORE calling Order Service.
         *
         * If stock fails and we need a refund, we already
         * have the Stripe PaymentIntent available.
         */

        payment.setStripePaymentIntentId(
                session.getPaymentIntent());

        paymentRepository.save(payment);

        /*
         * -----------------------------------------------------
         * IDEMPOTENCY - ALREADY PAID
         * -----------------------------------------------------
         */

        if ("PAID".equalsIgnoreCase(
                payment.getStatus())) {

            System.out.println(
                    "Payment already PAID. Skipping.");

            return;
        }

        /*
         * -----------------------------------------------------
         * IDEMPOTENCY - ALREADY REFUNDED
         * -----------------------------------------------------
         *
         * This is important if Stripe sends the same webhook
         * again after we already refunded the payment.
         *
         * We DO NOT create another Stripe refund.
         *
         * We simply make sure Order Service also knows
         * that the order is refunded.
         */

        if ("REFUNDED".equalsIgnoreCase(
                payment.getStatus())) {

            System.out.println(
                    "Payment already REFUNDED.");

            UpdatePaymentStatusRequest refundedRequest = new UpdatePaymentStatusRequest();

            refundedRequest.setPaymentStatus(
                    "REFUNDED");

            orderClient.updatePaymentStatus(
                    payment.getOrderId(),
                    refundedRequest,
                    internalServiceKey);

            return;
        }

        /*
         * -----------------------------------------------------
         * TELL ORDER SERVICE PAYMENT SUCCEEDED
         * -----------------------------------------------------
         */

        UpdatePaymentStatusRequest paidRequest = new UpdatePaymentStatusRequest();

        paidRequest.setPaymentStatus("PAID");

        System.out.println(
                "Calling Order Service for order ID: "
                        + payment.getOrderId());

        try {

            /*
             * Order Service will:
             *
             * 1. Deduct stock
             * 2. Mark order PAID
             * 3. Mark order CONFIRMED
             * 4. Clear cart
             *
             * If stock is insufficient,
             * Order Service returns HTTP 409.
             */

            OrderResponse orderResponse = orderClient.updatePaymentStatus(
                    payment.getOrderId(),
                    paidRequest,
                    internalServiceKey);

            /*
             * -------------------------------------------------
             * ORDER SUCCESS
             * -------------------------------------------------
             */

            System.out.println(
                    "Order Service response received: "
                            + orderResponse.getOrderNumber());

            /*
             * Only now do we mark Payment as PAID.
             */

            payment.setStatus("PAID");

            paymentRepository.save(payment);

            System.out.println(
                    "Payment updated to PAID");

            System.out.println(
                    "========== CHECKOUT SESSION HANDLED ==========");

        } catch (FeignException.Conflict e) {

            /*
             * -------------------------------------------------
             * STOCK FAILURE
             * -------------------------------------------------
             *
             * Stripe payment succeeded, but our application
             * cannot fulfill the order because stock is gone.
             *
             * Therefore we must REFUND the Stripe payment.
             */

            System.out.println(
                    "===== STOCK FAILURE DETECTED =====");

            System.out.println(
                    "Order Service returned 409 Conflict");

            System.out.println(
                    "Order cannot be fulfilled.");

            System.out.println(
                    "Starting Stripe refund...");

            try {

                /*
                 * -------------------------------------------------
                 * 1. REFUND STRIPE
                 * -------------------------------------------------
                 */

                Refund refund = refundStripePayment(
                        session.getPaymentIntent(),
                        payment.getOrderId());

                /*
                 * -------------------------------------------------
                 * 2. SAVE REFUND INFORMATION
                 * -------------------------------------------------
                 */

                payment.setStatus("REFUNDED");

                payment.setStripeRefundId(
                        refund.getId());

                paymentRepository.save(payment);

                System.out.println(
                        "Payment updated to REFUNDED");

                System.out.println(
                        "Stripe Refund ID: "
                                + refund.getId());

                /*
                 * -------------------------------------------------
                 * 3. UPDATE ORDER SERVICE
                 * -------------------------------------------------
                 *
                 * Order Service will:
                 *
                 * paymentStatus = REFUNDED
                 * status = CANCELLED
                 *
                 * It will NOT clear the cart.
                 */

                UpdatePaymentStatusRequest refundedRequest = new UpdatePaymentStatusRequest();

                refundedRequest.setPaymentStatus(
                        "REFUNDED");

                orderClient.updatePaymentStatus(
                        payment.getOrderId(),
                        refundedRequest,
                        internalServiceKey);

                System.out.println(
                        "===== COMPENSATION COMPLETE =====");

                System.out.println(
                        "Payment = REFUNDED");

                System.out.println(
                        "Order = CANCELLED");

                System.out.println(
                        "Stripe Refund ID = "
                                + refund.getId());

            } catch (StripeException stripeException) {

                /*
                 * -------------------------------------------------
                 * STRIPE REFUND FAILED
                 * -------------------------------------------------
                 */

                System.out.println(
                        "===== STRIPE REFUND FAILED =====");

                stripeException.printStackTrace();

                /*
                 * Do NOT mark Payment as REFUNDED.
                 *
                 * The payment actually succeeded at Stripe,
                 * so we need webhook processing to fail/retry
                 * rather than pretending the refund happened.
                 */

                throw new RuntimeException(
                        "Stripe refund failed",
                        stripeException);

            } catch (Exception compensationException) {

                /*
                 * -------------------------------------------------
                 * COMPENSATION FAILED
                 * -------------------------------------------------
                 */

                System.out.println(
                        "===== COMPENSATION FAILED =====");

                compensationException.printStackTrace();

                throw new RuntimeException(
                        "Refund compensation failed",
                        compensationException);
            }
        }
    }

    /*
     * =========================================================
     * STRIPE REFUND
     * =========================================================
     */

    private Refund refundStripePayment(
            String paymentIntentId,
            Long orderId) throws StripeException {

        if (paymentIntentId == null
                || paymentIntentId.isBlank()) {

            throw new IllegalStateException(
                    "Stripe PaymentIntent ID is missing "
                            + "for order " + orderId);
        }

        System.out.println(
                "===== STRIPE REFUND STARTED =====");

        System.out.println(
                "Stripe secret key configured: "
                        + (stripeSecretKey != null
                                && !stripeSecretKey.isBlank()));

        System.out.println(
                "Order ID: "
                        + orderId);

        System.out.println(
                "PaymentIntent ID: "
                        + paymentIntentId);

        /*
         * Stripe refund request.
         */

        RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(
                        paymentIntentId)
                .build();

        /*
         * Deterministic idempotency key.
         *
         * If the same webhook is retried,
         * Stripe receives the same idempotency key.
         */

        RequestOptions requestOptions = RequestOptions.builder()
                .setApiKey(stripeSecretKey)
                .setIdempotencyKey(
                        "refund-order-" + orderId)
                .build();

        Refund refund = Refund.create(
                params,
                requestOptions);

        System.out.println(
                "===== STRIPE REFUND SUCCESS =====");

        System.out.println(
                "Refund ID: "
                        + refund.getId());

        System.out.println(
                "Refund status: "
                        + refund.getStatus());

        return refund;
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

        if ("REFUNDED".equals(payment.getStatus())) {

            System.out.println(
                    "Payment already REFUNDED. "
                            + "Ignoring expiration.");

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