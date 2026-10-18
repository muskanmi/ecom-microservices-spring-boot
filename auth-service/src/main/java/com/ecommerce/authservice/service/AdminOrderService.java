
package com.ecommerce.authservice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    @Value("${order.service.url:http://localhost:8083}")
    private String orderServiceUrl;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    private final RestClient.Builder restClientBuilder;

    public List<Map<String, Object>> getAllOrders() {
        return restClientBuilder.build()
                .get()
                .uri(orderServiceUrl + "/api/orders/internal/admin")
                .header("X-Internal-Service-Key", internalServiceKey)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                });
    }

    public Map<String, Object> getOrderById(Long orderId) {
        return restClientBuilder.build()
                .get()
                .uri(orderServiceUrl + "/api/orders/internal/admin/{orderId}", orderId)
                .header("X-Internal-Service-Key", internalServiceKey)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });
    }

    public Map<String, Object> updateOrderStatus(Long orderId, String status) {
        RestClient restClient = restClientBuilder.build();

        return restClient.put()
                .uri(orderServiceUrl + "/api/orders/internal/{orderId}/status", orderId)
                .header("X-Internal-Service-Key", internalServiceKey)
                .body(Map.of("status", status))
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });
    }

    public Map<String, Object> updateShippingInfo(
            Long orderId,
            Map<String, String> request) {

        return restClientBuilder.build()
                .put()
                .uri(
                        orderServiceUrl + "/api/orders/internal/{orderId}/shipping",
                        orderId)
                .header("X-Internal-Service-Key", internalServiceKey)
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {
                });
    }
}
