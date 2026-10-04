package com.ecommerce.orderservice.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.orderservice.client.CatalogStockClient;
import com.ecommerce.orderservice.client.PaymentClient;
import com.ecommerce.orderservice.dto.CartDetailsResponse;
import com.ecommerce.orderservice.dto.CartItemDetailResponse;
import com.ecommerce.orderservice.dto.CatalogProductImageResponse;
import com.ecommerce.orderservice.dto.CatalogProductResponse;
import com.ecommerce.orderservice.dto.CatalogStockDeductionItemRequest;
import com.ecommerce.orderservice.dto.CatalogStockDeductionRequest;
import com.ecommerce.orderservice.dto.CreateOrderRequest;
import com.ecommerce.orderservice.dto.OrderItemResponse;
import com.ecommerce.orderservice.dto.OrderResponse;
import com.ecommerce.orderservice.dto.PaymentRefundResponse;
import com.ecommerce.orderservice.dto.ShippingAddressRequest;
import com.ecommerce.orderservice.dto.ShippingAddressResponse;
import com.ecommerce.orderservice.entity.Order;
import com.ecommerce.orderservice.entity.OrderItem;
import com.ecommerce.orderservice.entity.OrderStatus;
import com.ecommerce.orderservice.entity.PaymentStatus;
import com.ecommerce.orderservice.entity.ShippingAddress;
import com.ecommerce.orderservice.exception.InsufficientStockException;
import com.ecommerce.orderservice.repository.OrderRepository;

import feign.FeignException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final CatalogStockClient catalogStockClient;
    private final PaymentClient paymentClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    @Transactional
    public OrderResponse createOrder(
            Long userId,
            CreateOrderRequest request) {

        CartDetailsResponse cart = cartService.getCartDetails(userId);

        if (cart == null ||
                cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException("Cart is empty");
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        Order order = Order.builder()
                .userId(userId)
                .customerEmail(request.getCustomerEmail())
                .orderNumber(generateOrderNumber())
                .discount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .status(OrderStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingAddress(
                        mapShippingAddress(
                                request.getShippingAddress()))
                .build();

        for (CartItemDetailResponse cartItem : cart.getItems()) {

            CatalogProductResponse product = cartItem.getProduct();

            if (product == null) {
                throw new RuntimeException(
                        "Product information not available");
            }

            if (product.getPrice() == null) {
                throw new RuntimeException(
                        "Product price not available");
            }

            int quantity = cartItem.getQuantity();

            if (quantity <= 0) {
                throw new RuntimeException(
                        "Invalid cart quantity");
            }

            if (product.getStock() == null ||
                    quantity > product.getStock()) {

                throw new InsufficientStockException(
                        "Only " +
                                product.getStock() +
                                " items are available for " +
                                product.getName());
            }

            BigDecimal itemTotal = product.getPrice()
                    .multiply(
                            BigDecimal.valueOf(quantity))
                    .setScale(
                            2,
                            RoundingMode.HALF_UP);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productImage(
                            getPrimaryImage(product))
                    .quantity(quantity)
                    .price(product.getPrice())
                    .totalPrice(itemTotal)
                    .build();

            order.getItems().add(orderItem);

            subtotal = subtotal.add(itemTotal);
        }

        BigDecimal discount = BigDecimal.ZERO;

        BigDecimal shippingFee = BigDecimal.ZERO;

        BigDecimal totalAmount = subtotal
                .subtract(discount)
                .add(shippingFee)
                .setScale(
                        2,
                        RoundingMode.HALF_UP);

        order.setSubtotal(subtotal);
        order.setDiscount(discount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse getOrderById(
            Long orderId,
            Long userId) {

        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Order not found"));

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(
            Long orderId,
            Long userId) {

        System.out.println(
                "===== CUSTOMER ORDER CANCELLATION =====");

        System.out.println(
                "Order ID: " + orderId);

        System.out.println(
                "User ID: " + userId);

        /*
         * ---------------------------------------------------------
         * FIND ORDER BELONGING TO THIS USER
         * ---------------------------------------------------------
         */
        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Order not found"));

        System.out.println(
                "Current order status: "
                        + order.getStatus());

        System.out.println(
                "Current payment status: "
                        + order.getPaymentStatus());

        /*
         * ---------------------------------------------------------
         * ALREADY CANCELLED
         * ---------------------------------------------------------
         */
        if (order.getStatus() == OrderStatus.CANCELLED) {

            throw new RuntimeException(
                    "Order is already cancelled");
        }

        /*
         * ---------------------------------------------------------
         * CASE 1:
         *
         * Payment is still pending.
         *
         * No Stripe refund is required.
         * ---------------------------------------------------------
         */
        if (order.getStatus() == OrderStatus.PENDING_PAYMENT
                && order.getPaymentStatus() == PaymentStatus.PENDING) {

            order.setStatus(
                    OrderStatus.CANCELLED);

            order.setPaymentStatus(
                    PaymentStatus.CANCELLED);

            Order savedOrder = orderRepository.save(order);

            System.out.println(
                    "===== PENDING ORDER CANCELLED =====");

            return mapToResponse(savedOrder);
        }

        /*
         * ---------------------------------------------------------
         * CASE 2:
         *
         * Order is already paid.
         *
         * Refund payment through Payment Service.
         * ---------------------------------------------------------
         */
        if (order.getStatus() == OrderStatus.CONFIRMED
                && order.getPaymentStatus() == PaymentStatus.PAID) {

            System.out.println(
                    "===== PAID ORDER CANCELLATION =====");

            /*
             * 1. Refund Stripe payment
             */
            PaymentRefundResponse refundResponse = paymentClient.refundPayment(
                    orderId,
                    internalServiceKey);

            System.out.println(
                    "Payment refund status: "
                            + refundResponse.getPaymentStatus());

            System.out.println(
                    "Stripe refund ID: "
                            + refundResponse.getStripeRefundId());

            /*
             * 2. Build stock restoration request
             * from the order's stored items.
             */
            List<CatalogStockDeductionItemRequest> stockItems = order.getItems()
                    .stream()
                    .map(item -> new CatalogStockDeductionItemRequest(
                            item.getProductId(),
                            item.getQuantity()))
                    .toList();

            CatalogStockDeductionRequest stockRequest = new CatalogStockDeductionRequest(
                    stockItems);

            System.out.println(
                    "===== STOCK RESTORATION REQUEST =====");

            stockItems.forEach(item -> System.out.println(
                    "Product ID: "
                            + item.getProductId()
                            + ", Quantity: "
                            + item.getQuantity()));

            /*
             * 3. Restore stock
             */
            catalogStockClient.restoreStock(
                    stockRequest,
                    internalServiceKey);

            System.out.println(
                    "===== STOCK RESTORATION SUCCESS =====");

            /*
             * 4. Update order
             */
            order.setStatus(
                    OrderStatus.CANCELLED);

            order.setPaymentStatus(
                    PaymentStatus.REFUNDED);

            Order savedOrder = orderRepository.save(order);

            System.out.println(
                    "===== PAID ORDER CANCELLED SUCCESSFULLY =====");

            System.out.println(
                    "Order status: "
                            + savedOrder.getStatus());

            System.out.println(
                    "Payment status: "
                            + savedOrder.getPaymentStatus());

            return mapToResponse(savedOrder);
        }

        /*
         * ---------------------------------------------------------
         * Any other state cannot be cancelled.
         * ---------------------------------------------------------
         */
        throw new RuntimeException(
                "This order cannot be cancelled at this stage.");
    }

    @Transactional
    public List<OrderResponse> getUserOrders(
            Long userId) {

        return orderRepository
                .findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updatePaymentStatus(
            Long orderId,
            String paymentStatus) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        System.out.println(
                "===== PAYMENT STATUS UPDATE =====");

        System.out.println(
                "Order ID: " + order.getId());

        System.out.println(
                "Current order payment status: "
                        + order.getPaymentStatus());

        System.out.println(
                "Requested payment status: "
                        + paymentStatus);

        PaymentStatus newPaymentStatus;

        try {

            newPaymentStatus = PaymentStatus.valueOf(
                    paymentStatus.toUpperCase());

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid payment status: "
                            + paymentStatus);
        }

        /*
         * Idempotency:
         *
         * Stripe can send the same webhook more than once.
         * If this order is already PAID, don't deduct stock again.
         */
        if (order.getPaymentStatus() == PaymentStatus.PAID
                && newPaymentStatus == PaymentStatus.PAID) {

            System.out.println(
                    "ORDER ALREADY PAID -> SKIPPING STOCK DEDUCTION");

            return mapToResponse(order);
        }

        /*
         * Successful Stripe payment.
         */
        if (newPaymentStatus == PaymentStatus.PAID) {

            /*
             * Build stock deduction request from the
             * order's stored items.
             */
            List<CatalogStockDeductionItemRequest> stockItems = order.getItems()
                    .stream()
                    .map(item -> new CatalogStockDeductionItemRequest(
                            item.getProductId(),
                            item.getQuantity()))
                    .toList();

            System.out.println(
                    "===== STOCK DEDUCTION REQUEST =====");

            stockItems.forEach(item -> System.out.println(
                    "Product ID: "
                            + item.getProductId()
                            + ", Quantity: "
                            + item.getQuantity()));

            CatalogStockDeductionRequest stockRequest = new CatalogStockDeductionRequest(
                    stockItems);

            /*
             * Deduct stock before confirming the order.
             */
            try {

                catalogStockClient.deductStock(
                        stockRequest,
                        internalServiceKey);

                System.out.println(
                        "===== STOCK DEDUCTION SUCCESS =====");

            } catch (FeignException.Conflict e) {

                /*
                 * Catalog Service returns 409 when there
                 * isn't enough stock.
                 */
                System.out.println(
                        "===== INSUFFICIENT STOCK =====");

                System.out.println(
                        "Catalog Service returned 409 Conflict");

                throw new InsufficientStockException(
                        "Insufficient stock for one or more products in this order.");
            }

            /*
             * Stock deduction succeeded.
             */
            order.setPaymentStatus(
                    PaymentStatus.PAID);

            order.setStatus(
                    OrderStatus.CONFIRMED);

            /*
             * Clear cart only after successful payment
             * AND successful stock deduction.
             */
            cartService.clearCart(
                    order.getUserId());
        }

        /*
         * Payment cancelled.
         */
        else if (newPaymentStatus == PaymentStatus.CANCELLED) {

            order.setPaymentStatus(
                    PaymentStatus.CANCELLED);

            order.setStatus(
                    OrderStatus.CANCELLED);
        }

        /*
         * Payment refunded.
         */
        else if (newPaymentStatus == PaymentStatus.REFUNDED) {

            System.out.println(
                    "===== REFUND RECEIVED FROM PAYMENT SERVICE =====");

            System.out.println(
                    "Order ID: " + order.getId());

            order.setPaymentStatus(
                    PaymentStatus.REFUNDED);

            order.setStatus(
                    OrderStatus.CANCELLED);

            System.out.println(
                    "Order payment status set to REFUNDED");

            System.out.println(
                    "Order status set to CANCELLED");
        }

        /*
         * Any other payment status.
         */
        else {

            order.setPaymentStatus(
                    newPaymentStatus);
        }

        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    private String generateOrderNumber() {

        return "ORD-" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();
    }

    private ShippingAddress mapShippingAddress(
            ShippingAddressRequest request) {

        return new ShippingAddress(
                request.getFullName(),
                request.getPhone(),
                request.getAddressLine1(),
                request.getAddressLine2(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                request.getCountry() == null ||
                        request.getCountry().isBlank()
                                ? "India"
                                : request.getCountry());
    }

    private String getPrimaryImage(
            CatalogProductResponse product) {

        if (product.getImages() == null ||
                product.getImages().isEmpty()) {

            return null;
        }

        return product.getImages()
                .stream()
                .sorted(
                        Comparator.comparing(
                                CatalogProductImageResponse::getDisplayOrder,
                                Comparator.nullsLast(
                                        Integer::compareTo)))
                .map(CatalogProductImageResponse::getImageUrl)
                .findFirst()
                .orElse(null);
    }

    private OrderResponse mapToResponse(
            Order order) {

        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProductId(),
                        item.getProductName(),
                        item.getProductImage(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getTotalPrice()))
                .toList();

        ShippingAddress address = order.getShippingAddress();

        ShippingAddressResponse addressResponse = address == null
                ? null
                : new ShippingAddressResponse(
                        address.getFullName(),
                        address.getPhone(),
                        address.getAddressLine1(),
                        address.getAddressLine2(),
                        address.getCity(),
                        address.getState(),
                        address.getPincode(),
                        address.getCountry());

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getCustomerEmail(),
                order.getOrderNumber(),
                order.getSubtotal(),
                order.getDiscount(),
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getPaymentStatus().name(),
                addressResponse,
                order.getCreatedAt(),
                items);
    }
}
