package com.ecommerce.catalogservice.controller;

import com.ecommerce.catalogservice.dto.AddToWishlistRequest;
import com.ecommerce.catalogservice.dto.WishlistResponse;
import com.ecommerce.catalogservice.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/items")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody AddToWishlistRequest request) {

        return ResponseEntity.ok(
                wishlistService.addToWishlist(
                        userId,
                        request));
    }

    @GetMapping
    public ResponseEntity<WishlistResponse> getWishlist(
            @RequestHeader("X-User-Id") Long userId) {

        return ResponseEntity.ok(
                wishlistService.getWishlist(userId));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeFromWishlist(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long itemId) {

        wishlistService.removeFromWishlist(
                userId,
                itemId);

        return ResponseEntity.noContent().build();
    }
}