package com.ecommerce.authservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.authservice.dto.AuthResponse;
import com.ecommerce.authservice.dto.CreateSellerProfileRequest;
import com.ecommerce.authservice.dto.LoginRequest;
import com.ecommerce.authservice.dto.RegisterRequest;
import com.ecommerce.authservice.dto.SellerProfileResponse;
import com.ecommerce.authservice.dto.UpdateProfileRequest;
import com.ecommerce.authservice.dto.UserProfileResponse;
import com.ecommerce.authservice.entity.SellerProfile;
import com.ecommerce.authservice.entity.User;
import com.ecommerce.authservice.security.JwtUtil;
import com.ecommerce.authservice.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;





@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerUser(request);

        String token = jwtUtil.generateToken(user.getEmail());

        AuthResponse response = new AuthResponse(token, user.getId(), user.getRole());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser( @Valid @RequestBody LoginRequest request) {
       User user = authService.loginUser(request);
       String token = jwtUtil.generateToken(user.getEmail());
       AuthResponse response = new AuthResponse(token, user.getId(), user.getRole());
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.getUserByEmail(email);

        UserProfileResponse response = new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateUserProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = authService.updateUserProfile(email, request);

        UserProfileResponse response = new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/seller-profile")
    public ResponseEntity<SellerProfileResponse> createSellerProfile( @Valid @RequestBody CreateSellerProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        SellerProfile sellerProfile = authService.createSellerProfile(email, request);

        SellerProfileResponse response = new SellerProfileResponse(sellerProfile.getId(), sellerProfile.getUserId(), sellerProfile.getShopName(), sellerProfile.getApprovalStatus());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @PutMapping("/seller-profile")
    public ResponseEntity<SellerProfileResponse> updateSellerProfile(@Valid @RequestBody CreateSellerProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        SellerProfile sellerProfile = authService.updateSellerProfile(email, request);

        SellerProfileResponse response = new SellerProfileResponse(sellerProfile.getId(), sellerProfile.getUserId(), sellerProfile.getShopName(), sellerProfile.getApprovalStatus());

        return ResponseEntity.ok(response);
    }
}
