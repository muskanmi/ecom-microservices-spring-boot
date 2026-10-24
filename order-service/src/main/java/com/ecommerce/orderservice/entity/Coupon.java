package com.ecommerce.orderservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CouponType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal value;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal minimumOrderAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal maximumDiscountAmount;

    @Column(nullable = false)
    private boolean active;

    private LocalDateTime startsAt;

    private LocalDateTime expiresAt;
}