package com.ecommerce.paymentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.paymentservice.entity.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByStripeSessionId(
            String stripeSessionId);

    List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

}
