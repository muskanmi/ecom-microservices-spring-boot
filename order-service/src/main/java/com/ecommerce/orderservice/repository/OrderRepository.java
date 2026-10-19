package com.ecommerce.orderservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ecommerce.orderservice.entity.Order;

import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            JOIN o.items i
            WHERE i.sellerId = :sellerId
            ORDER BY o.createdAt DESC
            """)
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);
}
