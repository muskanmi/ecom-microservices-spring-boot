package com.ecommerce.authservice.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.authservice.dto.CreateSellerProfileRequest;
import com.ecommerce.authservice.dto.ForgotPasswordRequest;
import com.ecommerce.authservice.dto.ForgotPasswordResponse;
import com.ecommerce.authservice.dto.LoginRequest;
import com.ecommerce.authservice.dto.RegisterRequest;
import com.ecommerce.authservice.dto.UpdateProfileRequest;
import com.ecommerce.authservice.entity.SellerProfile;
import com.ecommerce.authservice.entity.User;
import com.ecommerce.authservice.repository.SellerProfileRepository;
import com.ecommerce.authservice.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SellerProfileRepository sellerProfileRepository;

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    @Transactional
    public User loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    @Transactional
    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }

    @Transactional
    public User updateUserProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        return userRepository.save(user);
    }

    @Transactional
    public SellerProfile createSellerProfile(String email, CreateSellerProfileRequest request) {
        User user = getUserByEmail(email);

        if (!user.getRole().equals("SELLER")) {
            throw new RuntimeException("Only Seller can create a seller profile");
        }

        if (sellerProfileRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("Seller Profile already exists");
        }

        SellerProfile sellerProfile = new SellerProfile();

        sellerProfile.setShopName(request.getShopName());
        sellerProfile.setUserId(user.getId());
        sellerProfile.setApprovalStatus("PENDING");
        sellerProfile.setCreatedAt(LocalDateTime.now());

        return sellerProfileRepository.save(sellerProfile);
    }

    @Transactional
    public SellerProfile updateSellerProfile(String email, CreateSellerProfileRequest request) {
        User user = getUserByEmail(email);

        if (!user.getRole().equals("SELLER")) {
            throw new RuntimeException("Only Seller can update a seller profile");
        }

        if (!sellerProfileRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("Seller does not exist");
        }

        SellerProfile sellerProfile = sellerProfileRepository.findByUserId(user.getId());
        if (sellerProfile == null) {
            throw new RuntimeException("Seller Profile does not exist");
        }

        sellerProfile.setShopName(request.getShopName());

        return sellerProfileRepository.save(sellerProfile);
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOptonal = userRepository.findByEmail(request.getEmail());
        String token = null;

        if (userOptonal.isPresent()) {
            User user = userOptonal.get();
            token = UUID.randomUUID().toString();

            user.setResetToken(token);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
            userRepository.save(user);
        }

        return new ForgotPasswordResponse(
                "If that email exists, a reset link has been sent.",
                token);
    }
}
