
package com.ecommerce.authservice.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ecommerce.authservice.dto.AdminSellerResponse;
import com.ecommerce.authservice.entity.SellerProfile;
import com.ecommerce.authservice.entity.User;
import com.ecommerce.authservice.repository.SellerProfileRepository;
import com.ecommerce.authservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminSellerService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminSellerResponse> getAllSellers() {
        return sellerProfileRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminSellerResponse updateApprovalStatus(
            Long sellerProfileId,
            String requestedStatus) {

        if (requestedStatus == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Approval status is required");
        }

        String status = requestedStatus
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!status.equals("APPROVED")
                && !status.equals("REJECTED")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be APPROVED or REJECTED");
        }

        SellerProfile profile = sellerProfileRepository
                .findById(sellerProfileId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Seller profile not found"));

        profile.setApprovalStatus(status);

        SellerProfile savedProfile = sellerProfileRepository.save(profile);

        return toResponse(savedProfile);
    }

    private AdminSellerResponse toResponse(SellerProfile profile) {
        User user = userRepository.findById(profile.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found for seller profile"));

        return new AdminSellerResponse(
                profile.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                profile.getShopName(),
                profile.getApprovalStatus(),
                profile.getCreatedAt());
    }
}
