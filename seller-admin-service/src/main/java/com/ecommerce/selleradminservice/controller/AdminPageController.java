package com.ecommerce.selleradminservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class AdminPageController {

    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    @GetMapping({ "/admin", "/admin/" })
    public String adminDashboard() {
        return "admin/dashboard";
    }

    // =========================================================
    // PRODUCTS
    // =========================================================

    @GetMapping("/admin/products")
    public String productsPage() {
        return "admin/products";
    }

    @GetMapping("/admin/products/new")
    public String createProductPage() {
        return "admin/product-form";
    }

    @GetMapping("/admin/products/{productId}/edit")
    public String editProductPage(
            @PathVariable Long productId) {

        return "admin/product-edit";
    }

    // =========================================================
    // ORDERS
    // =========================================================

    @GetMapping("/admin/orders")
    public String ordersPage() {
        return "admin/orders";
    }

    @GetMapping("/admin/orders/{orderId}")
    public String orderDetailsPage(
            @PathVariable Long orderId) {

        return "admin/order-details";
    }
}