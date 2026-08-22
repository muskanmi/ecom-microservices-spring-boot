package com.ecommerce.authservice.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;

    private String name;

    private String email;

    private String role;

    private String avatarUrl;

    private LocalDateTime memberSince;
}
