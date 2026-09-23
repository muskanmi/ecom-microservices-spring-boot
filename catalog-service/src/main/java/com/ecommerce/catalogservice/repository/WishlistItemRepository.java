package com.ecommerce.catalogservice.repository;

import com.ecommerce.catalogservice.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    Optional<WishlistItem> findByWishlistIdAndProductId(
            Long wishlistId,
            Long productId);

    List<WishlistItem> findByWishlistId(Long wishlistId);
}