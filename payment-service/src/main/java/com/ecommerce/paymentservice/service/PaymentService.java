package com.ecommerce.paymentservice.service;

import com.ecommerce.paymentservice.client.OrderClient;
import com.ecommerce.paymentservice.dto.OrderItemResponse;
import com.ecommerce.paymentservice.dto.OrderResponse;
import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.exception.OrderNotPayableException;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final com.stripe.StripeClient stripeClient;
    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    public String createCheckoutSession(
            Long orderId,
            Long userId) throws StripeException {

        OrderResponse order = orderClient.getOrderById(
                orderId,
                userId);

        if (order == null) {
            throw new RuntimeException(
                    "Order not found");
        }

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException(
                    "You cannot pay for this order");
        }

        /*
         * ---------------------------------------------------------
         * ORDER MUST BE PAYABLE
         * ---------------------------------------------------------
         *
         * Only:
         *
         * status = PENDING_PAYMENT
         * paymentStatus = PENDING
         *
         * can create a Stripe Checkout Session.
         */
        if (!"PENDING_PAYMENT".equals(order.getStatus())
                || !"PENDING".equals(order.getPaymentStatus())) {

            throw new OrderNotPayableException(
                    "Order is not available for payment");
        }

        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (OrderItemResponse item : order.getItems()) {

            long amountInMinorUnit = item.getPrice()
                    .movePointRight(2)
                    .longValueExact();

            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity(
                            item.getQuantity().longValue())
                    .setPriceData(
                            SessionCreateParams.LineItem.PriceData
                                    .builder()
                                    .setCurrency("inr")
                                    .setUnitAmount(
                                            amountInMinorUnit)
                                    .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData
                                                    .builder()
                                                    .setName(
                                                            item.getProductName())
                                                    .build())
                                    .build())
                    .build();

            lineItems.add(lineItem);
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(
                        SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(
                        frontendUrl
                                + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(
                        frontendUrl
                                + "/payment/cancel?orderId="
                                + orderId)
                .addAllLineItem(lineItems)
                .putMetadata(
                        "orderId",
                        String.valueOf(orderId))
                .putMetadata(
                        "userId",
                        String.valueOf(userId))
                .build();

        Session session = stripeClient
                .v1()
                .checkout()
                .sessions()
                .create(params);

        Payment payment = Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(order.getTotalAmount())
                .currency("inr")
                .status("PENDING")
                .stripeSessionId(session.getId())
                .build();

        paymentRepository.save(payment);

        return session.getUrl();
    }
}
