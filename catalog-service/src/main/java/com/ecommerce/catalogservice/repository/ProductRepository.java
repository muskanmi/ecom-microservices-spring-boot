package com.ecommerce.catalogservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecommerce.catalogservice.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
