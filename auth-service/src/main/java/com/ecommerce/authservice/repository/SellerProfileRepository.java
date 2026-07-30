package com.ecommerce.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.authservice.entity.SellerProfile;

@Repository
public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {
    
    public boolean existsByUserId(Long userId);

    public SellerProfile findByUserId(Long userId);
}
