package com.ecommerce.authservice.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.authservice.dto.AdminCustomerResponse;
import com.ecommerce.authservice.entity.User;
import com.ecommerce.authservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminCustomerResponse> getAllCustomers() {
        return userRepository
                .findByRoleIgnoreCaseOrderByCreatedAtDesc("CUSTOMER")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AdminCustomerResponse toResponse(User user) {
        return new AdminCustomerResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getCreatedAt());
    }
}