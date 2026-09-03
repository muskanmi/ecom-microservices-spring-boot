package com.ecommerce.catalogservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.catalogservice.entity.Product;
import com.ecommerce.catalogservice.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

}
