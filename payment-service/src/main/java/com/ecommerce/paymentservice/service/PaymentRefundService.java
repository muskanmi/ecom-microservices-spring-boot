
package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.NotificationClient;
import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.RefundPaymentResponse;
import com.ecommerce.paymentservice.dto.SendEmailRequest;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentRefundService {

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;
    private final NotificationClient notificationClient;
    private final RazorpayClient razorpayClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Transactional
    public RefundPaymentResponse refundPayment(Long orderId) {
        /*
         * Prefer a currently PAID payment. If none exists, return
         * the most recent completed refund for an idempotent retry.
         *
         * This avoids treating an old refunded payment as the
         * active payment when a newer PAID attempt exists.
         */
        Payment payment = paymentRepository
                .findFirstByOrderIdAndStatusOrderByCreatedAtDesc(
                        orderId, "PAID")
                .orElseGet(() -> findLatestRefundedPayment(orderId));

        if (payment == null) {
            throw new IllegalStateException(
                    "No PAID or REFUNDED payment found for order: " + orderId);
        }

        if ("REFUNDED".equalsIgnoreCase(payment.getStatus())) {
            return buildResponse(payment);
        }

        String provider = payment.getProvider();

        if ("RAZORPAY".equalsIgnoreCase(provider)) {
            refundRazorpayPayment(payment);
        } else if ("STRIPE".equalsIgnoreCase(provider)
                || provider == null
                || provider.isBlank()) {
            refundStripePayment(payment);
        } else {
            throw new IllegalStateException(
                    "Unsupported payment provider: " + provider);
        }

        payment.setStatus("REFUNDED");
        paymentRepository.save(payment);

        /*
         * Do not roll back a completed provider refund because
         * order lookup or email delivery failed.
         */
        try {
            OrderResponse order = orderClient.getOrderById(
                    payment.getOrderId(),
                    payment.getUserId());

            sendRefundEmail(payment, order);
        } catch (Exception e) {
            System.err.println(
                    "Refund completed, but refund notification could not be sent. "
                            + "Order ID: " + payment.getOrderId()
                            + ", reason: " + e.getMessage());
        }

        return buildResponse(payment);
    }

    private Payment findLatestRefundedPayment(Long orderId) {
        List<Payment> payments = paymentRepository.findByOrderIdOrderByCreatedAtDesc(orderId);

        return payments.stream()
                .filter(p -> "REFUNDED".equalsIgnoreCase(p.getStatus()))
                .findFirst()
                .orElse(null);
    }

    private void refundStripePayment(Payment payment) {
        /*
         * If a Stripe refund ID is already persisted, do not create
         * another refund.
         */
        if (payment.getStripeRefundId() != null
                && !payment.getStripeRefundId().isBlank()) {
            return;
        }

        String paymentIntentId = payment.getStripePaymentIntentId();

        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new IllegalStateException(
                    "Stripe PaymentIntent ID is missing for order: "
                            + payment.getOrderId());
        }

        try {
            RequestOptions options = RequestOptions.builder()
                    .setApiKey(stripeSecretKey)
                    .setIdempotencyKey(
                            "refund-order-" + payment.getOrderId())
                    .build();

            Refund refund = Refund.create(
                    com.stripe.param.RefundCreateParams.builder()
                            .setPaymentIntent(paymentIntentId)
                            .build(),
                    options);

            payment.setStripeRefundId(refund.getId());
            paymentRepository.save(payment);
        } catch (StripeException e) {
            throw new IllegalStateException(
                    "Stripe refund failed for order: "
                            + payment.getOrderId(),
                    e);
        }
    }

    private void refundRazorpayPayment(Payment payment) {
        /*
         * A stored refund ID means the provider refund was already
         * created. Do not submit a second refund.
         */
        if (payment.getRazorpayRefundId() != null
                && !payment.getRazorpayRefundId().isBlank()) {
            return;
        }

        String razorpayPaymentId = payment.getRazorpayPaymentId();

        if (razorpayPaymentId == null || razorpayPaymentId.isBlank()) {
            throw new IllegalStateException(
                    "Razorpay payment ID is missing for order: "
                            + payment.getOrderId());
        }

        try {
            JSONObject refundRequest = new JSONObject();
            JSONObject notes = new JSONObject();
            notes.put("localOrderId", String.valueOf(payment.getOrderId()));
            notes.put("localPaymentId", String.valueOf(payment.getId()));
            refundRequest.put("notes", notes);

            /*
             * Omitting the amount requests a full refund.
             * The payment ID is the provider's captured payment ID,
             * not the Razorpay order ID.
             */
            com.razorpay.Refund refund = razorpayClient.payments.refund(
                    razorpayPaymentId,
                    refundRequest);

            String refundId = refund.get("id");

            if (refundId == null || refundId.isBlank()) {
                throw new IllegalStateException(
                        "Razorpay did not return a refund ID");
            }

            payment.setRazorpayRefundId(refundId);
            paymentRepository.save(payment);
        } catch (RazorpayException e) {
            throw new IllegalStateException(
                    "Razorpay refund failed for order: "
                            + payment.getOrderId(),
                    e);
        }
    }

    private void sendRefundEmail(
            Payment payment,
            OrderResponse order) {

        if (order == null
                || order.getCustomerEmail() == null
                || order.getCustomerEmail().isBlank()) {
            return;
        }

        String orderNumber = order.getOrderNumber() == null
                ? String.valueOf(payment.getOrderId())
                : order.getOrderNumber();

        SendEmailRequest request = new SendEmailRequest();
        request.setRecipientEmail(order.getCustomerEmail());
        request.setSubject("Payment Refunded - " + orderNumber);
        request.setMessage(
                "Hello,\n\n"
                        + "Your payment for order " + orderNumber
                        + " has been refunded.\n\n"
                        + "Refund amount: ₹" + payment.getAmount() + "\n\n"
                        + "The time taken for the refund to appear depends "
                        + "on your bank and payment provider.\n\n"
                        + "Thank you,\nMarketplace Team");

        try {
            notificationClient.sendEmail(internalServiceKey, request);
        } catch (Exception e) {
            System.err.println(
                    "Refund email failed for order "
                            + payment.getOrderId()
                            + ": " + e.getMessage());
        }
    }

    private RefundPaymentResponse buildResponse(Payment payment) {
        return RefundPaymentResponse.builder()
                .orderId(payment.getOrderId())
                .paymentId(payment.getId())
                .paymentStatus(payment.getStatus())
                .stripeRefundId(payment.getStripeRefundId())
                .razorpayRefundId(payment.getRazorpayRefundId())
                .amount(payment.getAmount())
                .build();
    }
}
