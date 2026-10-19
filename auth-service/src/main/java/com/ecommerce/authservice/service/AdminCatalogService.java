
package com.ecommerce.authservice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCatalogService {

    @Value("${catalog.service.url:http://localhost:8082}")
    private String catalogServiceUrl;

    @Value("${internal.service.key}")
    private String internalServiceKey;

    private final RestClient.Builder restClientBuilder;

    public List<Map<String, Object>> getAllProducts() {
        return restClientBuilder.build()
                .get()
                .uri(catalogServiceUrl + "/api/products/internal/admin")
                .header("X-Internal-Service-Key", internalServiceKey)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                });
    }

    public void updateProductActivation(Long productId, boolean active) {
        restClientBuilder.build()
                .put()
                .uri(catalogServiceUrl
                        + "/api/products/internal/admin/{productId}/activation?active={active}",
                        productId, active)
                .header("X-Internal-Service-Key", internalServiceKey)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new IllegalStateException(
                            "Catalog Service rejected product activation. HTTP status: "
                                    + response.getStatusCode());
                })
                .toBodilessEntity();
    }
}
