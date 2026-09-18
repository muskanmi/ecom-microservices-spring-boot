package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.client.CatalogProductClient;
import com.ecommerce.orderservice.dto.AddToCartRequest;
import com.ecommerce.orderservice.dto.CartDetailsResponse;
import com.ecommerce.orderservice.dto.CartItemDetailResponse;
import com.ecommerce.orderservice.dto.CartItemResponse;
import com.ecommerce.orderservice.dto.CartResponse;
import com.ecommerce.orderservice.dto.CatalogProductResponse;
import com.ecommerce.orderservice.entity.Cart;
import com.ecommerce.orderservice.entity.CartItem;
import com.ecommerce.orderservice.repository.CartItemRepository;
import com.ecommerce.orderservice.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

        private final CartRepository cartRepository;
        private final CartItemRepository cartItemRepository;
        private final CatalogProductClient catalogProductClient;

        @Transactional
        public CartResponse addToCart(Long userId, AddToCartRequest request) {

                // 1. Find existing cart or create a new one
                Cart cart = cartRepository.findByUserId(userId)
                                .orElseGet(() -> {
                                        Cart newCart = new Cart();
                                        newCart.setUserId(userId);
                                        return cartRepository.save(newCart);
                                });

                // 2. Check whether the product already exists in the cart
                CartItem cartItem = cartItemRepository
                                .findByCartIdAndProductId(
                                                cart.getId(),
                                                request.getProductId())
                                .orElse(null);

                // 3. Existing product -> increase quantity
                if (cartItem != null) {

                        cartItem.setQuantity(
                                        cartItem.getQuantity() + request.getQuantity());

                        cartItemRepository.save(cartItem);

                } else {

                        // 4. New product -> create cart item
                        cartItem = new CartItem();
                        cartItem.setProductId(request.getProductId());
                        cartItem.setQuantity(request.getQuantity());
                        cartItem.setCart(cart);

                        cartItemRepository.save(cartItem);
                }

                // 5. Read cart items from database
                List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

                // 6. Convert to response
                List<CartItemResponse> itemResponses = cartItems.stream()
                                .map(item -> new CartItemResponse(
                                                item.getId(),
                                                item.getProductId(),
                                                item.getQuantity()))
                                .toList();

                return new CartResponse(
                                cart.getId(),
                                cart.getUserId(),
                                itemResponses);
        }

        @Transactional
        public CartResponse getCart(Long userId) {
                Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
                        Cart newCart = new Cart();
                        newCart.setUserId(userId);

                        return cartRepository.save(newCart);
                });

                List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

                List<CartItemResponse> itemResponses = cartItems.stream()
                                .map(item -> new CartItemResponse(
                                                item.getId(),
                                                item.getProductId(),
                                                item.getQuantity()))
                                .toList();

                return new CartResponse(
                                cart.getId(),
                                cart.getUserId(),
                                itemResponses);
        }

        @Transactional(readOnly = true)
        public CartDetailsResponse getCartDetails(Long userId) {

                Cart cart = cartRepository.findByUserId(userId)
                                .orElseGet(() -> {
                                        Cart newCart = new Cart();
                                        newCart.setUserId(userId);
                                        return cartRepository.save(newCart);
                                });

                List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

                List<CartItemDetailResponse> items = cartItems.stream()
                                .map(item -> {

                                        CatalogProductResponse product = catalogProductClient.getProductById(
                                                        item.getProductId());

                                        return new CartItemDetailResponse(
                                                        item.getId(),
                                                        item.getProductId(),
                                                        item.getQuantity(),
                                                        product);
                                })
                                .toList();

                CartDetailsResponse response = new CartDetailsResponse();
                response.setCartId(cart.getId());
                response.setUserId(cart.getUserId());
                response.setItems(items);

                return response;
        }
}