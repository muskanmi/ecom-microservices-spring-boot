package com.ecommerce.selleradminservice.service;

import com.ecommerce.selleradminservice.client.CatalogClient;
import com.ecommerce.selleradminservice.client.OrderClient;
import com.ecommerce.selleradminservice.dto.CatalogProductResponse;
import com.ecommerce.selleradminservice.dto.CreateProductRequest;
import com.ecommerce.selleradminservice.dto.OrderResponse;
import com.ecommerce.selleradminservice.dto.UpdateOrderStatusRequest;
import com.ecommerce.selleradminservice.dto.UpdateShippingInfoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerAdminService {

    private final OrderClient orderClient;
    private final CatalogClient catalogClient;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    public List<OrderResponse> getAllOrders() {

        return orderClient.getAllOrders(
                internalServiceKey);
    }

    public OrderResponse getOrderById(Long orderId) {

        return orderClient.getOrderById(
                orderId,
                internalServiceKey);
    }

    public OrderResponse updateShippingInfo(
            Long orderId,
            UpdateShippingInfoRequest request) {

        return orderClient.updateShippingInfo(
                orderId,
                request,
                internalServiceKey);
    }

    public OrderResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request) {

        return orderClient.updateOrderStatus(
                orderId,
                request,
                internalServiceKey);
    }

    public List<CatalogProductResponse> getAllProducts(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return catalogClient.getAllProducts(
                category,
                minPrice,
                maxPrice);
    }

    public CatalogProductResponse createProduct(
            CreateProductRequest request) {

        return catalogClient.createProduct(request);
    }
}