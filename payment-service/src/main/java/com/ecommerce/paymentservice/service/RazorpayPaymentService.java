
package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.NotificationClient;
import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.RazorpayOrderResponse;
import com.ecommerce.paymentservice.dto.RazorpayVerifyRequest;
import com.ecommerce.paymentservice.dto.SendEmailRequest;
import com.ecommerce.paymentservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.exception.OrderNotPayableException;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;
    private final NotificationClient notificationClient;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @Transactional
    public RazorpayOrderResponse createOrder(
            Long localOrderId,
            Long userId) throws RazorpayException {

        OrderResponse order = orderClient.getOrderById(
                localOrderId,
                userId);

        if (order == null
                || order.getUserId() == null
                || !order.getUserId().equals(userId)) {
            throw new OrderNotPayableException(
                    "Order not found or does not belong to you");
        }

        if (!"PENDING_PAYMENT".equals(order.getStatus())
                || !"PENDING".equals(order.getPaymentStatus())) {
            throw new OrderNotPayableException(
                    "Order is not available for payment");
        }

        BigDecimal amount = order.getTotalAmount();

        if (amount == null || amount.signum() <= 0) {
            throw new OrderNotPayableException(
                    "Order amount must be greater than zero");
        }

        long amountInPaise = amount
                .setScale(2, RoundingMode.UNNECESSARY)
                .movePointRight(2)
                .longValueExact();

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", "order_" + localOrderId);

        JSONObject notes = new JSONObject();
        notes.put("localOrderId", String.valueOf(localOrderId));
        notes.put("userId", String.valueOf(userId));
        options.put("notes", notes);

        Order razorpayOrder = razorpayClient.orders.create(options);
        String razorpayOrderId = razorpayOrder.get("id");

        Payment payment = Payment.builder()
                .orderId(localOrderId)
                .userId(userId)
                .amount(amount)
                .currency("INR")
                .status("PENDING")
                .provider("RAZORPAY")
                .razorpayOrderId(razorpayOrderId)
                .build();

        paymentRepository.save(payment);

        return new RazorpayOrderResponse(
                keyId,
                razorpayOrderId,
                amountInPaise,
                "INR",
                localOrderId);
    }

    /*
     * Do not wrap the entire method in one database transaction.
     * Provider refunds and Order Service updates are remote actions.
     * Local payment records must remain persisted if a remote call fails.
     */
    public void verifyPayment(
            Long userId,
            RazorpayVerifyRequest request) throws RazorpayException {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new OrderNotPayableException(
                        "Razorpay order was not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new OrderNotPayableException(
                    "This payment does not belong to you");
        }

        if (!"RAZORPAY".equalsIgnoreCase(payment.getProvider())) {
            throw new OrderNotPayableException(
                    "Payment provider does not match");
        }

        /*
         * Idempotent callback handling.
         */
        if ("PAID".equalsIgnoreCase(payment.getStatus())) {
            if (request.getRazorpayPaymentId().equals(
                    payment.getRazorpayPaymentId())) {
                return;
            }

            throw new OrderNotPayableException(
                    "This Razorpay order has already been paid");
        }

        if ("REFUNDED".equalsIgnoreCase(payment.getStatus())) {
            throw new OrderNotPayableException(
                    "This payment has already been refunded");
        }

        if (!"PENDING".equalsIgnoreCase(payment.getStatus())) {
            throw new OrderNotPayableException(
                    "This payment is not available for verification");
        }

        JSONObject signatureData = new JSONObject();
        signatureData.put(
                "razorpay_order_id",
                request.getRazorpayOrderId());
        signatureData.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId());
        signatureData.put(
                "razorpay_signature",
                request.getRazorpaySignature());

        boolean validSignature = Utils.verifyPaymentSignature(
                signatureData,
                keySecret);

        if (!validSignature) {
            throw new OrderNotPayableException(
                    "Razorpay payment signature is invalid");
        }

        /*
         * Confirm captured status directly with Razorpay.
         */
        com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(
                request.getRazorpayPaymentId());

        String providerOrderId = razorpayPayment.get("order_id");
        String providerStatus = razorpayPayment.get("status");

        if (!request.getRazorpayOrderId().equals(providerOrderId)) {
            throw new OrderNotPayableException(
                    "Payment does not match the Razorpay order");
        }

        if (!"captured".equalsIgnoreCase(providerStatus)) {
            throw new OrderNotPayableException(
                    "Razorpay has not captured this payment");
        }

        /*
         * Persist provider confirmation before contacting Order Service.
         * This leaves an audit trail if order confirmation fails.
         */
        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId());
        payment.setRazorpaySignature(
                request.getRazorpaySignature());
        paymentRepository.save(payment);

        UpdatePaymentStatusRequest statusRequest = new UpdatePaymentStatusRequest();
        statusRequest.setPaymentStatus("PAID");

        try {
            OrderResponse orderResponse = orderClient.updatePaymentStatus(
                    payment.getOrderId(),
                    statusRequest,
                    internalServiceKey);

            /*
             * Mark the local payment as PAID only after Order Service
             * successfully confirms the order.
             */
            payment.setStatus("PAID");
            paymentRepository.save(payment);

            /*
             * Send the same order-confirmation email used by Stripe.
             * Email failures must not undo a successful payment.
             */
            sendNotificationEmail(
                    orderResponse.getCustomerEmail(),
                    "Order Confirmed - " + orderResponse.getOrderNumber(),
                    "Hello,\n\n"
                            + "Your order "
                            + orderResponse.getOrderNumber()
                            + " has been successfully confirmed.\n\n"
                            + "Order Total: ₹"
                            + orderResponse.getTotalAmount()
                            + "\n\n"
                            + "Thank you for shopping with Marketplace.\n\n"
                            + "Regards,\n"
                            + "Marketplace Team");

        } catch (FeignException.Conflict conflict) {
            /*
             * The payment was captured, but the order could not be
             * confirmed, for example because inventory was unavailable.
             */
            refundAfterOrderConfirmationFailure(payment, conflict);
        }
    }

    private void refundAfterOrderConfirmationFailure(
            Payment payment,
            FeignException.Conflict originalConflict) {

        payment.setStatus("REFUND_PENDING");
        paymentRepository.save(payment);

        try {
            JSONObject refundRequest = new JSONObject();
            JSONObject notes = new JSONObject();
            notes.put("localOrderId", String.valueOf(payment.getOrderId()));
            notes.put("localPaymentId", String.valueOf(payment.getId()));
            notes.put("reason", "ORDER_CONFIRMATION_FAILED");
            refundRequest.put("notes", notes);

            com.razorpay.Refund refund = razorpayClient.payments.refund(
                    payment.getRazorpayPaymentId(),
                    refundRequest);

            String refundId = refund.get("id");

            if (refundId == null || refundId.isBlank()) {
                throw new IllegalStateException(
                        "Razorpay did not return a refund ID");
            }

            payment.setRazorpayRefundId(refundId);
            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);

            /*
             * Tell Order Service that the captured payment was refunded.
             * If this remote update fails, keep the refund ID locally
             * so reconciliation can repair the order later.
             */
            try {
                UpdatePaymentStatusRequest refundedRequest = new UpdatePaymentStatusRequest();
                refundedRequest.setPaymentStatus("REFUNDED");

                orderClient.updatePaymentStatus(
                        payment.getOrderId(),
                        refundedRequest,
                        internalServiceKey);
            } catch (Exception orderUpdateException) {
                System.err.println(
                        "Razorpay refund succeeded, but Order Service "
                                + "could not be updated. Order ID: "
                                + payment.getOrderId()
                                + ", refund ID: " + refundId
                                + ", reason: "
                                + orderUpdateException.getMessage());
            }

            throw new OrderNotPayableException(
                    "Payment was captured but the order could not be confirmed. "
                            + "A refund has been initiated.");

        } catch (RazorpayException | IllegalStateException refundException) {
            payment.setStatus("REFUND_PENDING");
            paymentRepository.save(payment);

            throw new IllegalStateException(
                    "Order confirmation failed and the Razorpay refund "
                            + "could not be confirmed. Manual reconciliation "
                            + "is required for order " + payment.getOrderId(),
                    refundException);
        }
    }

    private void sendNotificationEmail(
            String recipientEmail,
            String subject,
            String message) {

        if (recipientEmail == null || recipientEmail.isBlank()) {
            System.out.println(
                    "Razorpay order confirmation email skipped: customer email is missing.");
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
                    "===== RAZORPAY ORDER CONFIRMATION EMAIL SENT =====");
            System.out.println("Recipient: " + recipientEmail);
            System.out.println("Subject: " + subject);

        } catch (Exception e) {
            /*
             * Do not fail or reverse a successfully confirmed payment
             * just because the email service is temporarily unavailable.
             */
            System.err.println(
                    "===== RAZORPAY ORDER CONFIRMATION EMAIL FAILED =====");
            System.err.println("Recipient: " + recipientEmail);
            System.err.println("Reason: " + e.getMessage());
        }
    }
}
