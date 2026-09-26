package com.ecommerce.orderservice.service;

import com.ecommerce.orderservice.client.CatalogProductClient;
import com.ecommerce.orderservice.dto.AddToCartRequest;
import com.ecommerce.orderservice.dto.CartDetailsResponse;
import com.ecommerce.orderservice.dto.CartItemDetailResponse;
import com.ecommerce.orderservice.dto.CartItemResponse;
import com.ecommerce.orderservice.dto.CartResponse;
import com.ecommerce.orderservice.dto.CatalogProductResponse;
import com.ecommerce.orderservice.dto.UpdateCartItemRequest;
import com.ecommerce.orderservice.entity.Cart;
import com.ecommerce.orderservice.entity.CartItem;
import com.ecommerce.orderservice.exception.InsufficientStockException;
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

                // get product from catalog service
                CatalogProductResponse product = catalogProductClient.getProductById(request.getProductId());

                // validate product exists
                if (product == null) {
                        throw new RuntimeException("Product not found");
                }

                // validate stock
                if (product.getStock() == null || product.getStock() <= 0) {
                        throw new InsufficientStockException(
                                        "Product is out of stock");
                }

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

                // calculate requested final quantity
                int newQuantity;

                if (cartItem != null) {
                        newQuantity = cartItem.getQuantity() + request.getQuantity();
                } else {
                        newQuantity = request.getQuantity();
                }

                // final cart qiuantity cannot exceed stock
                if (newQuantity > product.getStock()) {
                        throw new InsufficientStockException(
                                        "Only "
                                                        + product.getStock()
                                                        + " items are available. "
                                                        + "You already have "
                                                        + (cartItem != null ? cartItem.getQuantity() : 0)
                                                        + " in your cart.");
                }

                // 3. Update existing item
                if (cartItem != null) {

                        cartItem.setQuantity(
                                        newQuantity);

                        cartItemRepository.save(cartItem);

                } else {

                        // 4. create new cart item
                        CartItem newCartItem = new CartItem();

                        newCartItem.setCart(cart);
                        newCartItem.setProductId(request.getProductId());
                        newCartItem.setQuantity(request.getQuantity());

                        cartItemRepository.save(newCartItem);
                }

                // 5. return updated cart
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

        @Transactional
        public CartDetailsResponse updateCartItem(Long userId, Long itemid, UpdateCartItemRequest request) {

                Cart cart = cartRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                CartItem cartItem = cartItemRepository.findById(itemid)
                                .orElseThrow(() -> new RuntimeException("Cart Item not found"));

                if (!cartItem.getCart().getId().equals(cart.getId())) {
                        throw new RuntimeException("Cart item does not belong to this user");
                }

                // Get latest stock from Catalog Service
                CatalogProductResponse product = catalogProductClient.getProductById(
                                cartItem.getProductId());

                if (product == null) {
                        throw new RuntimeException("Product not found");
                }

                if (request.getQuantity() < 1) {
                        throw new RuntimeException(
                                        "Quantity must be at least 1");
                }

                int currentQuantity = cartItem.getQuantity();
                int requestedQuantity = request.getQuantity();
                int availableStock = product.getStock();

                boolean increasing = requestedQuantity > currentQuantity;

                // Only block when the customer is trying
                // to increase beyond available stock.
                if (increasing && requestedQuantity > availableStock) {
                        throw new InsufficientStockException(
                                        "Only " + availableStock
                                                        + " items are available.");
                }

                cartItem.setQuantity(requestedQuantity);
                cartItemRepository.save(cartItem);

                return getCartDetails(userId);

        }

        @Transactional
        public CartDetailsResponse removeCartItem(Long userId, Long itemId) {
                Cart cart = cartRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                CartItem item = cartItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("Cart item not found"));

                if (!item.getCart().getId().equals(cart.getId())) {
                        throw new RuntimeException(
                                        "Cart item does not belong to this user");
                }

                cartItemRepository.delete(item);

                return getCartDetails(userId);
        }

        @Transactional
        public void clearCart(Long userId) {

                Cart cart = cartRepository
                                .findByUserId(userId)
                                .orElse(null);

                if (cart == null) {
                        return;
                }

                List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

                if (items != null && !items.isEmpty()) {
                        cartItemRepository.deleteAll(items);
                }
        }
}