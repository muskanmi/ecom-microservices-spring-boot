package com.ecommerce.catalogservice.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ecommerce.catalogservice.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
                SELECT p FROM Product p
                WHERE (:category IS NULL OR :category = '' OR LOWER(p.category) = LOWER(:category))
                  AND (:minPrice IS NULL OR p.price >= :minPrice)
                  AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            """)
    List<Product> findProduct(String category, BigDecimal minPrice, BigDecimal maxPrice);
}
