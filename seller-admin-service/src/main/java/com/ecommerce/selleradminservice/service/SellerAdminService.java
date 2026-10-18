
package com.ecommerce.selleradminservice.service;

import com.ecommerce.selleradminservice.client.CatalogClient;
import com.ecommerce.selleradminservice.client.OrderClient;
import com.ecommerce.selleradminservice.dto.CatalogProductImageResponse;
import com.ecommerce.selleradminservice.dto.CatalogProductResponse;
import com.ecommerce.selleradminservice.dto.CreateProductRequest;
import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdateProductRequest;
import com.ecommerce.selleradminservice.dto.UpdateShippingInfoRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerAdminService {

    private final OrderClient orderClient;
    private final CatalogClient catalogClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    // =========================================================
    // ORDERS
    // =========================================================

    public List<OrderResponse> getAllOrders() {
        return orderClient.getAllOrders(internalServiceKey);
    }

    public OrderResponse getOrderById(Long orderId) {
        return orderClient.getOrderById(orderId, internalServiceKey);
    }

    public OrderResponse updateShippingInfo(
            Long orderId,
            UpdateShippingInfoRequest request) {

        return orderClient.updateShippingInfo(
                orderId, request, internalServiceKey);
    }

    public OrderResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request) {

        return orderClient.updateOrderStatus(
                orderId, request, internalServiceKey);
    }

    public OrderResponse updatePaymentStatus(
            Long orderId,
            UpdatePaymentStatusRequest request) {

        return orderClient.updatePaymentStatus(
                orderId, request, internalServiceKey);
    }

    // =========================================================
    // SELLER PRODUCTS
    // =========================================================

    public List<CatalogProductResponse> getAllProducts(
            Long sellerId,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return catalogClient.getAllProducts(
                internalServiceKey,
                sellerId,
                category,
                minPrice,
                maxPrice);
    }

    public CatalogProductResponse getProductById(
            Long sellerId,
            Long productId) {

        return catalogClient.getProductById(
                internalServiceKey,
                productId,
                sellerId);
    }

    public CatalogProductResponse createProduct(
            Long sellerId,
            CreateProductRequest request) {

        return catalogClient.createProduct(
                internalServiceKey,
                sellerId,
                request);
    }

    public CatalogProductResponse updateProduct(
            Long sellerId,
            Long productId,
            UpdateProductRequest request) {

        return catalogClient.updateProduct(
                internalServiceKey,
                productId,
                sellerId,
                request);
    }

    public void deleteProduct(Long sellerId, Long productId) {
        catalogClient.deleteProduct(
                internalServiceKey,
                productId,
                sellerId);
    }

    // =========================================================
    // SELLER PRODUCT IMAGES
    // =========================================================

    public List<CatalogProductImageResponse> uploadProductImages(
            Long sellerId,
            Long productId,
            List<MultipartFile> files) {

        return catalogClient.uploadImages(
                internalServiceKey,
                productId,
                sellerId,
                files);
    }

    public CatalogProductImageResponse updateProductImage(
            Long sellerId,
            Long productId,
            Long imageId,
            MultipartFile file) {

        return catalogClient.updateImage(
                internalServiceKey,
                productId,
                imageId,
                sellerId,
                file);
    }

    public void deleteProductImage(
            Long sellerId,
            Long productId,
            Long imageId) {

        catalogClient.deleteImage(
                internalServiceKey,
                productId,
                imageId,
                sellerId);
    }
}
