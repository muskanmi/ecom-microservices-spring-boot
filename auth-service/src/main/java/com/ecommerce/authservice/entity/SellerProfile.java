package com.ecommerce.authservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name="seller_profiles")
public class SellerProfile {
 
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    
    @Column(name= "user_id")
    private Long userId;

    @Column(name= "shop_name")
    private String shopName;

    @Column(name= "approval_status")
    private String approvalStatus;

    private LocalDateTime createdAt;
}
