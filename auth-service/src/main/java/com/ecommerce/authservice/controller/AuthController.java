package com.ecommerce.authservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.authservice.dto.AuthResponse;
import com.ecommerce.authservice.dto.LoginRequest;
import com.ecommerce.authservice.dto.RegisterRequest;
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
    
    
}
