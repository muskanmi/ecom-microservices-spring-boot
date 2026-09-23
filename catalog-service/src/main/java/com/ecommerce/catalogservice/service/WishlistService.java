package com.ecommerce.catalogservice.service;

import com.ecommerce.catalogservice.dto.AddToWishlistRequest;
import com.ecommerce.catalogservice.dto.ProductResponse;
import com.ecommerce.catalogservice.dto.WishlistItemResponse;
import com.ecommerce.catalogservice.dto.WishlistResponse;
import com.ecommerce.catalogservice.entity.Product;
import com.ecommerce.catalogservice.entity.Wishlist;
import com.ecommerce.catalogservice.entity.WishlistItem;
import com.ecommerce.catalogservice.repository.ProductRepository;
import com.ecommerce.catalogservice.repository.WishlistItemRepository;
import com.ecommerce.catalogservice.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional
    public WishlistResponse addToWishlist(
            Long userId,
            AddToWishlistRequest request) {

        // 1. Verify product exists
        productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Find wishlist or create one
        Wishlist wishlist = wishlistRepository
                .findByUserId(userId)
                .orElseGet(() -> {
                    Wishlist newWishlist = new Wishlist();
                    newWishlist.setUserId(userId);
                    return wishlistRepository.save(newWishlist);
                });

        // 3. Check whether product is already in wishlist
        boolean alreadyExists = wishlistItemRepository
                .findByWishlistIdAndProductId(
                        wishlist.getId(),
                        request.getProductId())
                .isPresent();

        if (!alreadyExists) {

            WishlistItem item = new WishlistItem();
            item.setProductId(request.getProductId());
            item.setWishlist(wishlist);

            wishlistItemRepository.save(item);
        }

        // 4. Return updated wishlist
        return getWishlist(userId);
    }

    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(Long userId) {

        Wishlist wishlist = wishlistRepository
                .findByUserId(userId)
                .orElse(null);

        if (wishlist == null) {
            return new WishlistResponse(
                    null,
                    userId,
                    List.of());
        }

        List<WishlistItemResponse> items = wishlistItemRepository
                .findByWishlistId(wishlist.getId())
                .stream()
                .map(item -> {

                    Product product = productRepository
                            .findById(item.getProductId())
                            .orElse(null);

                    ProductResponse productResponse = product != null
                            ? productService.mapToResponse(product)
                            : null;

                    return new WishlistItemResponse(
                            item.getId(),
                            item.getProductId(),
                            productResponse);
                })
                .toList();

        return new WishlistResponse(
                wishlist.getId(),
                wishlist.getUserId(),
                items);
    }

    @Transactional
    public void removeFromWishlist(
            Long userId,
            Long itemId) {

        Wishlist wishlist = wishlistRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wishlist not found"));

        WishlistItem item = wishlistItemRepository
                .findById(itemId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        // Prevent one user deleting another user's wishlist item
        if (!item.getWishlist().getId().equals(wishlist.getId())) {
            throw new RuntimeException(
                    "Wishlist item does not belong to this user");
        }

        wishlistItemRepository.delete(item);
    }
}