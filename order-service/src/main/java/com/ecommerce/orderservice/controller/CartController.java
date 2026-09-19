package com.ecommerce.orderservice.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.orderservice.dto.AddToCartRequest;
import com.ecommerce.orderservice.dto.CartDetailsResponse;
import com.ecommerce.orderservice.dto.CartResponse;
import com.ecommerce.orderservice.dto.UpdateCartItemRequest;
import com.ecommerce.orderservice.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

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

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(
                cartService.getCart(userId));
    }

    @GetMapping("/details")
    public ResponseEntity<CartDetailsResponse> getCartDetails(
            @RequestHeader("X-User-Id") Long userId) {

        return ResponseEntity.ok(
                cartService.getCartDetails(userId));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDetailsResponse> updateCartItem(@RequestHeader("X-User-Id") Long userId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(
                cartService.updateCartItem(userId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDetailsResponse> removeCartItem(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long itemId) {

        return ResponseEntity.ok(
                cartService.removeCartItem(userId, itemId));
    }

}
