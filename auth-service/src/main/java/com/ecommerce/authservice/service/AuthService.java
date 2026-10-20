package com.ecommerce.authservice.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.MessageDigest;
import java.util.Base64;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.authservice.client.NotificationClient;
import com.ecommerce.authservice.dto.ChangePasswordRequest;
import com.ecommerce.authservice.dto.CreateSellerProfileRequest;
import com.ecommerce.authservice.dto.ForgotPasswordRequest;
import com.ecommerce.authservice.dto.ForgotPasswordResponse;
import com.ecommerce.authservice.dto.LoginRequest;
import com.ecommerce.authservice.dto.RegisterRequest;
import com.ecommerce.authservice.dto.ResetPasswordRequest;
import com.ecommerce.authservice.dto.ResetPasswordResponse;
import com.ecommerce.authservice.dto.SendEmailRequest;
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
    private final NotificationClient notificationClient;
    private final String internalServiceKey = "INTERNAL_SERVICE_KEY";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private String hashResetToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Unable to hash reset token.", exception);
        }
    }

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        String requestedRole = request.getRole();

        if (requestedRole == null
                || (!requestedRole.equalsIgnoreCase("CUSTOMER")
                        && !requestedRole.equalsIgnoreCase("SELLER"))) {
            throw new IllegalArgumentException(
                    "Public registration only supports CUSTOMER or SELLER");
        }

        user.setRole(requestedRole.toUpperCase(java.util.Locale.ROOT));
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
    public SellerProfile getSellerProfile(String email) {

        User user = getUserByEmail(email);

        if (!user.getRole().equals("SELLER")) {
            throw new RuntimeException(
                    "Only Seller can access seller profile");
        }

        SellerProfile sellerProfile = sellerProfileRepository.findByUserId(user.getId());

        if (sellerProfile == null) {
            throw new RuntimeException(
                    "Seller Profile does not exist");
        }

        return sellerProfile;
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
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            byte[] randomBytes = new byte[32];
            SECURE_RANDOM.nextBytes(randomBytes);

            String token = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(randomBytes);

            user.setResetToken(hashResetToken(token));
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
            userRepository.save(user);

            notificationClient.sendEmail(
                    internalServiceKey,
                    new SendEmailRequest(
                            user.getEmail(),
                            "Password Reset Request",
                            "Use this token to reset your password: " + token));
        }

        return new ForgotPasswordResponse(
                "If that email exists, a reset link has been sent.");
    }

    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashResetToken(request.getToken());

        User user = userRepository.findByResetToken(tokenHash)
                .orElseThrow(() -> new RuntimeException(
                        "Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null
                || !user.getResetTokenExpiry().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        userRepository.save(user);

        return new ResetPasswordResponse("Successfully reset password");
    }

    @Transactional
    public User uploadAvatar(String email, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select an image");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("Image size must not exceed 5 MB");
        }

        String contentType = file.getContentType();

        if (!"image/jpeg".equals(contentType)) {
            throw new RuntimeException("Only JPG images are allowed");
        }

        User user = getUserByEmail(email);

        try {
            // Create uploads/avatars folder
            Path uploadPath = Paths.get("uploads", "avatars");
            Files.createDirectories(uploadPath);

            // Fixed filename based on user ID
            String fileName = user.getId() + ".jpg";

            Path filePath = uploadPath.resolve(fileName);

            // Save or replace existing avatar
            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING);

            // Save avatar URL in database
            String avatarUrl = "/uploads/avatars/" + fileName;

            user.setAvatarUrl(avatarUrl);

            return userRepository.save(user);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload avatar", e);
        }
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {

        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPasswordHash())) {

            throw new RuntimeException(
                    "New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }
}
