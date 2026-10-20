
package com.ecommerce.selleradminservice.service;

import com.ecommerce.selleradminservice.client.AuthClient;
import com.ecommerce.selleradminservice.client.CatalogClient;
import com.ecommerce.selleradminservice.client.OrderClient;
import com.ecommerce.selleradminservice.dto.CatalogProductImageResponse;
import com.ecommerce.selleradminservice.dto.CatalogProductResponse;
import com.ecommerce.selleradminservice.dto.CreateProductRequest;
import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.SellerProfileStatusResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdatePaymentStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdateProductRequest;
import com.ecommerce.selleradminservice.dto.UpdateShippingInfoRequest;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerAdminService {

    private final OrderClient orderClient;
    private final CatalogClient catalogClient;
    private final AuthClient authClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    // =========================================================
    // ORDERS
    // =========================================================

    public List<OrderResponse> getAllOrders(Long sellerId) {
        return orderClient.getOrdersForSeller(sellerId, internalServiceKey);
    }

    public OrderResponse getOrderById(Long orderId) {
        return orderClient.getOrderById(orderId, internalServiceKey);
    }

    public OrderResponse updateShippingInfo(
            Long sellerId,
            Long orderId,
            UpdateShippingInfoRequest request) {

        return orderClient.updateShippingInfoForSeller(
                orderId, sellerId, request, internalServiceKey);
    }

    public OrderResponse updateOrderStatus(
            Long sellerId,
            Long orderId,
            UpdateOrderStatusRequest request) {

        return orderClient.updateOrderStatusForSeller(
                orderId, sellerId, request, internalServiceKey);
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

        requireApprovedSeller();

        return catalogClient.createProduct(
                internalServiceKey,
                sellerId,
                request);
    }

    public CatalogProductResponse updateProduct(
            Long sellerId,
            Long productId,
            UpdateProductRequest request) {

        requireApprovedSeller();

        return catalogClient.updateProduct(
                internalServiceKey,
                productId,
                sellerId,
                request);
    }

    public void deleteProduct(Long sellerId, Long productId) {

        requireApprovedSeller();
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

        requireApprovedSeller();

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

        requireApprovedSeller();

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

        requireApprovedSeller();

        catalogClient.deleteImage(
                internalServiceKey,
                productId,
                imageId,
                sellerId);
    }

    private void requireApprovedSeller() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            throw new AccessDeniedException(
                    "Unable to verify seller approval status.");
        }

        HttpServletRequest request = attributes.getRequest();

        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AccessDeniedException(
                    "Authentication is required to manage products.");
        }

        final SellerProfileStatusResponse profile;

        try {
            profile = authClient.getSellerProfile(authorization);
        } catch (Exception exception) {
            // Fail closed: if approval cannot be verified, do not permit mutation.
            throw new AccessDeniedException(
                    "Unable to verify seller approval. Please try again later.");
        }

        if (profile == null || profile.getApprovalStatus() == null
                || !"APPROVED".equalsIgnoreCase(profile.getApprovalStatus().trim())) {
            throw new AccessDeniedException(
                    "Your seller account is not approved to manage products.");
        }
    }

    public OrderResponse getOrderForSeller(Long sellerId, Long orderId) {
        return orderClient.getOrderForSeller(
                orderId,
                sellerId,
                internalServiceKey);
    }
}
