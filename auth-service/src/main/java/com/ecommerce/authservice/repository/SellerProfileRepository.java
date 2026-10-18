
package com.ecommerce.authservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.authservice.entity.SellerProfile;

@Repository
public interface SellerProfileRepository
        extends JpaRepository<SellerProfile, Long> {

    boolean existsByUserId(Long userId);

    SellerProfile findByUserId(Long userId);

    List<SellerProfile> findAllByOrderByCreatedAtDesc();
}
