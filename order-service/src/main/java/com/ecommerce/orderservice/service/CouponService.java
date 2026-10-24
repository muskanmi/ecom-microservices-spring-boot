package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.dto.CouponValidationResponse;
import com.ecommerce.orderservice.entity.Coupon;
import com.ecommerce.orderservice.entity.CouponType;
import com.ecommerce.orderservice.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponValidationResponse validateCoupon(
            String submittedCode,
            BigDecimal subtotal) {

        if (submittedCode == null || submittedCode.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a coupon code");
        }

        if (subtotal == null || subtotal.signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Subtotal must be greater than zero");
        }

        String normalizedCode = submittedCode.trim();

        Coupon coupon = couponRepository
                .findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invalid coupon code"));

        LocalDateTime now = LocalDateTime.now();

        if (!coupon.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This coupon is not active");
        }

        if (coupon.getStartsAt() != null
                && now.isBefore(coupon.getStartsAt())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This coupon is not active yet");
        }

        if (coupon.getExpiresAt() != null
                && now.isAfter(coupon.getExpiresAt())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This coupon has expired");
        }

        if (subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Minimum order amount for this coupon is "
                            + coupon.getMinimumOrderAmount());
        }

        BigDecimal discount;

        if (coupon.getType() == CouponType.PERCENTAGE) {
            if (coupon.getValue().compareTo(BigDecimal.ZERO) <= 0
                    || coupon.getValue().compareTo(
                            new BigDecimal("100")) > 0) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Coupon percentage configuration is invalid");
            }

            discount = subtotal
                    .multiply(coupon.getValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            if (coupon.getMaximumDiscountAmount() != null) {
                discount = discount.min(
                        coupon.getMaximumDiscountAmount());
            }
        } else {
            discount = coupon.getValue();
        }

        discount = discount
                .max(BigDecimal.ZERO)
                .min(subtotal)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalAmount = subtotal
                .subtract(discount)
                .setScale(2, RoundingMode.HALF_UP);

        return new CouponValidationResponse(
                coupon.getCode(),
                subtotal.setScale(2, RoundingMode.HALF_UP),
                discount,
                totalAmount,
                "Coupon applied successfully");
    }
}