
package com.ecommerce.catalogservice.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecommerce.catalogservice.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

  // PUBLIC PRODUCT SEARCH: active products only

  @Query("""
      SELECT p FROM Product p
      LEFT JOIN p.category c
      LEFT JOIN c.parent parent
      WHERE p.active = true
        AND (
            :category IS NULL
            OR TRIM(:category) = ''
            OR LOWER(c.name) = LOWER(TRIM(:category))
            OR LOWER(parent.name) = LOWER(TRIM(:category))
        )
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
      """)
  List<Product> findProduct(
      @Param("category") String category,
      @Param("minPrice") BigDecimal minPrice,
      @Param("maxPrice") BigDecimal maxPrice);

  // Public product details: active products only

  Optional<Product> findByIdAndActiveTrue(Long id);

  // SELLER PRODUCT OWNERSHIP

  List<Product> findBySellerId(Long sellerId);

  Optional<Product> findByIdAndSellerId(Long id, Long sellerId);

  List<Product> findAllByOrderByIdAsc();

  // STOCK MANAGEMENT

  @Modifying
  @Query("""
      UPDATE Product p
      SET p.stock = p.stock - :quantity
      WHERE p.id = :productId
        AND p.active = true
        AND p.stock >= :quantity
      """)
  int deductStockIfAvailable(
      @Param("productId") Long productId,
      @Param("quantity") Integer quantity);

  @Modifying
  @Query("""
      UPDATE Product p
      SET p.stock = p.stock + :quantity
      WHERE p.id = :productId
      """)
  int restoreStock(
      @Param("productId") Long productId,
      @Param("quantity") Integer quantity);
}
