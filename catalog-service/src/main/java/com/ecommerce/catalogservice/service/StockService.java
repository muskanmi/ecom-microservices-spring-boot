package com.ecommerce.catalogservice.service;

import com.ecommerce.catalogservice.dto.StockDeductionItemRequest;
import com.ecommerce.catalogservice.dto.StockDeductionRequest;
import com.ecommerce.catalogservice.entity.Product;
import com.ecommerce.catalogservice.exception.InsufficientStockException;
import com.ecommerce.catalogservice.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockService {

    private final ProductRepository productRepository;

    @Transactional
    public void deductStock(
            StockDeductionRequest request) {

        for (StockDeductionItemRequest item : request.getItems()) {

            Product product = productRepository.findById(
                    item.getProductId()).orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found: "
                                            + item.getProductId()));

            System.out.println(
                    "===== CATALOG STOCK DEDUCTION =====");

            System.out.println(
                    "Product ID: "
                            + item.getProductId());

            System.out.println(
                    "Current stock: "
                            + product.getStock());

            System.out.println(
                    "Requested quantity: "
                            + item.getQuantity());

            int updatedRows = productRepository.deductStockIfAvailable(
                    item.getProductId(),
                    item.getQuantity());

            System.out.println(
                    "Updated rows: "
                            + updatedRows);

            if (updatedRows == 0) {

                throw new InsufficientStockException(
                        "Insufficient stock for product '"
                                + product.getName()
                                + "'. Available: "
                                + product.getStock()
                                + ", requested: "
                                + item.getQuantity());
            }

            System.out.println(
                    "Stock deduction completed successfully.");
        }
    }

    @Transactional
    public void restoreStock(StockDeductionRequest request) {

        System.out.println("===== RESTORING PRODUCT STOCK =====");

        for (StockDeductionItemRequest item : request.getItems()) {

            System.out.println(
                    "Restoring productId="
                            + item.getProductId()
                            + ", quantity="
                            + item.getQuantity());

            int updatedRows = productRepository.restoreStock(
                    item.getProductId(),
                    item.getQuantity());

            if (updatedRows == 0) {
                throw new RuntimeException(
                        "Product not found: "
                                + item.getProductId());
            }

            System.out.println(
                    "Stock restored successfully for productId="
                            + item.getProductId());
        }

        System.out.println(
                "===== STOCK RESTORATION COMPLETED =====");
    }
}