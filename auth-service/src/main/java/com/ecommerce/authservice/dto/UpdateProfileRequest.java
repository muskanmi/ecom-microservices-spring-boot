package com.ecommerce.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    // Optional: not validated with @NotBlank since a profile update
    // (name/email change) shouldn't be forced to resend the avatar too.
    private String avatarUrl;
}
