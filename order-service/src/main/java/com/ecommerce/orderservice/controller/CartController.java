package com.ecommerce.orderservice.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.orderservice.dto.AddToCartRequest;
import com.ecommerce.orderservice.dto.CartResponse;
import com.ecommerce.orderservice.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(@RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addToCart(userId, request);

        return ResponseEntity.ok(response);
    }

}
