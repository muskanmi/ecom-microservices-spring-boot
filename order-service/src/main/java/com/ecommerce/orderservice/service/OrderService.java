package com.ecommerce.orderservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.orderservice.dto.CartDetailsResponse;
import com.ecommerce.orderservice.dto.CartItemDetailResponse;
import com.ecommerce.orderservice.dto.CatalogProductImageResponse;
import com.ecommerce.orderservice.dto.CatalogProductResponse;
import com.ecommerce.orderservice.dto.CreateOrderRequest;
import com.ecommerce.orderservice.dto.OrderItemResponse;
import com.ecommerce.orderservice.dto.OrderResponse;
import com.ecommerce.orderservice.dto.ShippingAddressRequest;
import com.ecommerce.orderservice.dto.ShippingAddressResponse;
import com.ecommerce.orderservice.entity.Order;
import com.ecommerce.orderservice.entity.OrderItem;
import com.ecommerce.orderservice.entity.OrderStatus;
import com.ecommerce.orderservice.entity.PaymentStatus;
import com.ecommerce.orderservice.entity.ShippingAddress;
import com.ecommerce.orderservice.exception.InsufficientStockException;
import com.ecommerce.orderservice.repository.OrderRepository;

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
                .orElseThrow(
                        () -> new RuntimeException(
                                "Order not found"));

        PaymentStatus newPaymentStatus;

        try {
            newPaymentStatus = PaymentStatus.valueOf(
                    paymentStatus.toUpperCase());

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid payment status: " +
                            paymentStatus);
        }

        /*
         * Idempotency:
         * Stripe may send the same webhook more than once.
         */
        if (order.getPaymentStatus() == PaymentStatus.PAID
                && newPaymentStatus == PaymentStatus.PAID) {

            return mapToResponse(order);
        }

        order.setPaymentStatus(newPaymentStatus);

        if (newPaymentStatus == PaymentStatus.PAID) {

            order.setStatus(OrderStatus.CONFIRMED);

            /*
             * Clear cart only AFTER successful payment.
             */
            cartService.clearCart(order.getUserId());
        }

        if (newPaymentStatus == PaymentStatus.CANCELLED) {
            order.setStatus(OrderStatus.CANCELLED);
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
