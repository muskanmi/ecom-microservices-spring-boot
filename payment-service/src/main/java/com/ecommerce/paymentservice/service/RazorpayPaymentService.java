package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.dto.RazorpayOrderResponse;
import com.ecommerce.paymentservice.dto.RazorpayVerifyRequest;
import com.ecommerce.paymentservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.exception.OrderNotPayableException;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.PaymentClient;
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

        if (order == null || order.getUserId() == null
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

    @Transactional
    public void verifyPayment(
            Long userId,
            RazorpayVerifyRequest request)
            throws RazorpayException {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new OrderNotPayableException(
                        "Razorpay order was not found"));

        if (!payment.getUserId().equals(userId)) {
            throw new OrderNotPayableException(
                    "This payment does not belong to you");
        }

        if ("PAID".equalsIgnoreCase(payment.getStatus())) {
            // Idempotent: repeated callback must not confirm twice.
            return;
        }

        if (!"RAZORPAY".equalsIgnoreCase(payment.getProvider())) {
            throw new OrderNotPayableException(
                    "Payment provider does not match");
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

        // Verify the payment status with Razorpay's server, too.
        com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(
                request.getRazorpayPaymentId());

        String razorpayOrderIdFromPayment = razorpayPayment.get("order_id");
        String providerStatus = razorpayPayment.get("status");

        if (!request.getRazorpayOrderId().equals(
                razorpayOrderIdFromPayment)) {
            throw new OrderNotPayableException(
                    "Payment does not match the Razorpay order");
        }

        if (!"captured".equalsIgnoreCase(providerStatus)) {
            throw new OrderNotPayableException(
                    "Razorpay has not captured this payment");
        }

        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId());
        payment.setRazorpaySignature(
                request.getRazorpaySignature());

        UpdatePaymentStatusRequest statusRequest = new UpdatePaymentStatusRequest();
        statusRequest.setPaymentStatus("PAID");

        try {
            orderClient.updatePaymentStatus(
                    payment.getOrderId(),
                    statusRequest,
                    internalServiceKey);

            payment.setStatus("PAID");
            paymentRepository.save(payment);

        } catch (FeignException.Conflict exception) {
            /*
             * The order service rejected confirmation, for example
             * because inventory is no longer available.
             *
             * Do not mark the payment as PAID locally. Refund
             * compensation must be performed before returning a
             * final failure to the customer.
             */
            throw exception;
        }
    }
}