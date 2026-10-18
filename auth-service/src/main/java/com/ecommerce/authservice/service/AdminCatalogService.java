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
public class AdminCatalogService {

    @Value("${catalog.service.url:http://localhost:8082}")
    private String catalogServiceUrl;

    private final RestClient.Builder restClientBuilder;

    public List<Map<String, Object>> getAllProducts() {
        return restClientBuilder.build()
                .get()
                .uri(catalogServiceUrl + "/api/products")
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                });
    }
}