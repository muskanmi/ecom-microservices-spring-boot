package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.NotificationClient;
import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.RefundPaymentResponse;
import com.ecommerce.paymentservice.dto.SendEmailRequest;
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
    private final OrderClient orderClient;
    private final NotificationClient notificationClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Transactional
    public RefundPaymentResponse refundPayment(
            Long orderId) {

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
                    com.stripe.param.RefundCreateParams
                            .builder()
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

            /*
             * Get order details so we can send
             * the refund email to the customer.
             */
            try {

                OrderResponse orderResponse = orderClient.getOrderById(
                        payment.getOrderId(),
                        payment.getUserId());

                sendRefundEmail(
                        payment,
                        orderResponse);

            } catch (Exception e) {

                /*
                 * Do not fail a successful refund
                 * because email/order lookup failed.
                 */
                System.out.println(
                        "===== COULD NOT SEND REFUND EMAIL =====");

                System.out.println(
                        "Order ID: "
                                + payment.getOrderId());

                System.out.println(
                        "Reason: "
                                + e.getMessage());
            }

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

    private void sendRefundEmail(
            Payment payment,
            OrderResponse order) {

        try {

            String recipientEmail = order.getCustomerEmail();

            if (recipientEmail == null
                    || recipientEmail.isBlank()) {

                System.out.println(
                        "Refund email skipped: customer email is missing for order "
                                + payment.getOrderId());

                return;
            }

            String orderNumber = order.getOrderNumber();

            String subject = "Payment Refunded - " + orderNumber;

            String message = "Hello,\n\n"
                    + "Your order " + orderNumber
                    + " has been cancelled successfully.\n\n"
                    + "Payment Amount: ₹"
                    + payment.getAmount()
                    + "\n\n"
                    + "The payment has been refunded to your original payment method.\n"
                    + "Please allow some time for the refund to appear in your account, "
                    + "depending on your bank or payment provider.\n\n"
                    + "Thank you,\n"
                    + "Marketplace Team";

            SendEmailRequest request = new SendEmailRequest();

            request.setRecipientEmail(
                    recipientEmail);

            request.setSubject(subject);

            request.setMessage(message);

            notificationClient.sendEmail(
                    internalServiceKey,
                    request);

            System.out.println(
                    "===== REFUND EMAIL SENT =====");

            System.out.println(
                    "Recipient: " + recipientEmail);

            System.out.println(
                    "Subject: " + subject);

        } catch (Exception e) {

            /*
             * Email failure should NOT undo a successful Stripe refund.
             */
            System.out.println(
                    "===== REFUND EMAIL FAILED =====");

            System.out.println(
                    "Order ID: " + payment.getOrderId());

            System.out.println(
                    "Reason: " + e.getMessage());
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