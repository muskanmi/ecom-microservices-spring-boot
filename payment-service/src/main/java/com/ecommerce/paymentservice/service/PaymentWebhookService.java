package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.NotificationClient;
import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.SendEmailRequest;
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
    private final NotificationClient notificationClient;

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

        System.out.println(
                "Current payment status: "
                        + payment.getStatus());

        /*
         * Save Stripe PaymentIntent BEFORE calling Order Service.
         * Required in case we need to refund the payment.
         */
        payment.setStripePaymentIntentId(
                session.getPaymentIntent());

        paymentRepository.save(payment);

        /*
         * ---------------------------------------------------------
         * IDEMPOTENCY - ALREADY PAID
         * ---------------------------------------------------------
         */
        if ("PAID".equalsIgnoreCase(
                payment.getStatus())) {

            System.out.println(
                    "Payment already PAID. Skipping.");

            return;
        }

        /*
         * ---------------------------------------------------------
         * IDEMPOTENCY - ALREADY REFUNDED
         * ---------------------------------------------------------
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
         * ---------------------------------------------------------
         * TELL ORDER SERVICE PAYMENT SUCCEEDED
         * ---------------------------------------------------------
         */
        UpdatePaymentStatusRequest paidRequest = new UpdatePaymentStatusRequest();

        paidRequest.setPaymentStatus("PAID");

        System.out.println(
                "Calling Order Service for order ID: "
                        + payment.getOrderId());

        try {

            /*
             * Order Service:
             * 1. Deducts stock
             * 2. Marks order PAID
             * 3. Marks order CONFIRMED
             * 4. Clears cart
             *
             * If stock is insufficient, it returns 409.
             */
            OrderResponse orderResponse = orderClient.updatePaymentStatus(
                    payment.getOrderId(),
                    paidRequest,
                    internalServiceKey);

            /*
             * -----------------------------------------------------
             * ORDER SUCCESS
             * -----------------------------------------------------
             */
            System.out.println(
                    "Order Service response received: "
                            + orderResponse.getOrderNumber());

            payment.setStatus("PAID");

            paymentRepository.save(payment);

            /*
             * -----------------------------------------------------
             * SEND ORDER CONFIRMATION EMAIL
             * -----------------------------------------------------
             */
            sendNotificationEmail(

                    orderResponse.getCustomerEmail(),

                    "Order Confirmed - "
                            + orderResponse.getOrderNumber(),

                    "Hello,\n\n"
                            + "Your order "
                            + orderResponse.getOrderNumber()
                            + " has been successfully confirmed.\n\n"

                            + "Order Total: ₹"
                            + orderResponse.getTotalAmount()
                            + "\n\n"

                            + "Your payment was successful and "
                            + "your order is now confirmed.\n\n"

                            + "Thank you for shopping with Marketplace.\n\n"

                            + "Regards,\n"
                            + "Marketplace Team");

            System.out.println(
                    "Payment updated to PAID");

            System.out.println(
                    "========== CHECKOUT SESSION HANDLED ==========");

        } catch (FeignException.Conflict e) {

            /*
             * -----------------------------------------------------
             * STOCK FAILURE
             * -----------------------------------------------------
             *
             * Stripe payment succeeded, but the order cannot
             * be fulfilled because stock is unavailable.
             *
             * Therefore:
             * 1. Refund Stripe
             * 2. Mark Payment REFUNDED
             * 3. Mark Order REFUNDED/CANCELLED
             * 4. Send refund email
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
                 * 2. UPDATE PAYMENT SERVICE
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
                 */
                UpdatePaymentStatusRequest refundedRequest = new UpdatePaymentStatusRequest();

                refundedRequest.setPaymentStatus(
                        "REFUNDED");

                /*
                 * Capture the response because we need:
                 * customerEmail
                 * orderNumber
                 * totalAmount
                 */
                OrderResponse refundedOrder = orderClient.updatePaymentStatus(
                        payment.getOrderId(),
                        refundedRequest,
                        internalServiceKey);

                /*
                 * -------------------------------------------------
                 * 4. SEND REFUND EMAIL
                 * -------------------------------------------------
                 */
                sendNotificationEmail(

                        refundedOrder.getCustomerEmail(),

                        "Payment Refunded - "
                                + refundedOrder.getOrderNumber(),

                        "Hello,\n\n"

                                + "Your payment for order "
                                + refundedOrder.getOrderNumber()
                                + " has been successfully refunded.\n\n"

                                + "Refund Amount: ₹"
                                + refundedOrder.getTotalAmount()
                                + "\n\n"

                                + "The order was cancelled because "
                                + "the requested item(s) were no longer "
                                + "available.\n\n"

                                + "The refunded amount will be returned "
                                + "to your original payment method.\n\n"

                                + "We apologize for the inconvenience.\n\n"

                                + "Regards,\n"
                                + "Marketplace Team");

                /*
                 * -------------------------------------------------
                 * COMPENSATION COMPLETE
                 * -------------------------------------------------
                 */
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

                System.out.println(
                        "===== STRIPE REFUND FAILED =====");

                stripeException.printStackTrace();

                throw new RuntimeException(
                        "Stripe refund failed",
                        stripeException);

            } catch (Exception compensationException) {

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

    private void sendNotificationEmail(
            String recipientEmail,
            String subject,
            String message) {

        if (recipientEmail == null
                || recipientEmail.isBlank()) {

            System.out.println(
                    "Notification skipped: customer email is missing.");

            return;
        }

        try {

            SendEmailRequest request = new SendEmailRequest(
                    recipientEmail,
                    subject,
                    message);

            notificationClient.sendEmail(
                    internalServiceKey,
                    request);

            System.out.println(
                    "===== NOTIFICATION SENT =====");

            System.out.println(
                    "Recipient: "
                            + recipientEmail);

            System.out.println(
                    "Subject: "
                            + subject);

        } catch (Exception e) {

            /*
             * Notification failure must NOT make
             * payment/order processing fail.
             *
             * Payment and refund are more important
             * than email delivery.
             */

            System.out.println(
                    "===== NOTIFICATION FAILED =====");

            System.out.println(
                    "Recipient: "
                            + recipientEmail);

            System.out.println(
                    "Reason: "
                            + e.getMessage());
        }
    }
}