
package com.ecommerce.catalogservice.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.catalogservice.dto.CreateProductRequest;
import com.ecommerce.catalogservice.dto.ProductImageResponse;
import com.ecommerce.catalogservice.dto.ProductResponse;
import com.ecommerce.catalogservice.dto.UpdateProductRequest;
import com.ecommerce.catalogservice.entity.Category;
import com.ecommerce.catalogservice.entity.Product;
import com.ecommerce.catalogservice.entity.ProductImage;
import com.ecommerce.catalogservice.repository.CategoryRepository;
import com.ecommerce.catalogservice.repository.ProductImageRepository;
import com.ecommerce.catalogservice.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;

    // =========================================================
    // PUBLIC CUSTOMER PRODUCT OPERATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return productRepository.findProduct(category, minPrice, maxPrice)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return mapToResponse(product);
    }

    // =========================================================
    // SELLER PRODUCT OPERATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<ProductResponse> getSellerProducts(
            Long sellerId,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice) {

        return productRepository.findBySellerId(sellerId)
                .stream()
                .filter(product -> category == null || category.isBlank()
                        || (product.getCategory() != null
                                && product.getCategory().getName().equalsIgnoreCase(category)))
                .filter(product -> minPrice == null
                        || product.getPrice().compareTo(minPrice) >= 0)
                .filter(product -> maxPrice == null
                        || product.getPrice().compareTo(maxPrice) <= 0)
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProductResponse createSellerProduct(
            Long sellerId,
            CreateProductRequest request) {

        requireSellerId(sellerId);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMrp(request.getMrp());
        product.setCategory(category);
        product.setStock(request.getStock());
        product.setSellerId(sellerId);

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateSellerProduct(
            Long sellerId,
            Long productId,
            UpdateProductRequest request) {

        Product product = findSellerProduct(productId, sellerId);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMrp(request.getMrp());
        product.setCategory(category);
        product.setStock(request.getStock());

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteSellerProduct(Long sellerId, Long productId) {
        Product product = findSellerProduct(productId, sellerId);
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getSellerProductById(
            Long sellerId,
            Long productId) {

        return mapToResponse(findSellerProduct(productId, sellerId));
    }

    // =========================================================
    // SELLER IMAGE OPERATIONS
    // =========================================================

    @Transactional
    public List<ProductImageResponse> uploadSellerImages(
            Long sellerId,
            Long productId,
            List<MultipartFile> files) {

        findSellerProduct(productId, sellerId);
        return uploadImages(productId, files);
    }

    @Transactional
    public ProductImageResponse updateSellerImage(
            Long sellerId,
            Long productId,
            Long imageId,
            MultipartFile file) {

        findSellerProduct(productId, sellerId);
        return updateImage(productId, imageId, file);
    }

    @Transactional
    public void deleteSellerImage(
            Long sellerId,
            Long productId,
            Long imageId) {

        findSellerProduct(productId, sellerId);
        deleteImage(productId, imageId);
    }

    private Product findSellerProduct(Long productId, Long sellerId) {
        requireSellerId(sellerId);

        return productRepository.findByIdAndSellerId(productId, sellerId)
                .orElseThrow(() -> new RuntimeException(
                        "Product not found for this seller"));
    }

    private void requireSellerId(Long sellerId) {
        if (sellerId == null || sellerId <= 0) {
            throw new IllegalArgumentException("Valid seller ID is required");
        }
    }

    // =========================================================
    // EXISTING PUBLIC PRODUCT OPERATIONS
    // =========================================================

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMrp(request.getMrp());
        product.setCategory(category);
        product.setStock(request.getStock());

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(
            Long id,
            UpdateProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setMrp(request.getMrp());
        product.setCategory(category);
        product.setStock(request.getStock());

        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);
    }

    // =========================================================
    // PRODUCT RESPONSE MAPPING
    // =========================================================

    @Transactional(readOnly = true)
    public ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setMrp(product.getMrp());
        response.setStock(product.getStock());
        response.setSellerId(product.getSellerId());
        response.setCreatedAt(product.getCreatedAt());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());

            if (product.getCategory().getParent() != null) {
                response.setParentCategoryId(
                        product.getCategory().getParent().getId());
                response.setParentCategoryName(
                        product.getCategory().getParent().getName());
            }
        }

        List<ProductImageResponse> images = product.getImages()
                .stream()
                .map(image -> {
                    ProductImageResponse imageResponse = new ProductImageResponse();
                    imageResponse.setId(image.getId());
                    imageResponse.setImageUrl(image.getImageUrl());
                    imageResponse.setDisplayOrder(image.getDisplayOrder());
                    return imageResponse;
                })
                .toList();

        response.setImages(images);
        return response;
    }

    // =========================================================
    // EXISTING IMAGE OPERATIONS
    // =========================================================

    @Transactional
    public List<ProductImageResponse> uploadImages(
            Long id,
            List<MultipartFile> files) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Path uploadPath = Paths.get("uploads", "products", id.toString());

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }

        List<ProductImageResponse> responses = new ArrayList<>();

        int displayOrder = product.getImages().stream()
                .map(ProductImage::getDisplayOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String fileName = UUID.randomUUID() + "_"
                    + Paths.get(Objects.requireNonNullElse(
                            file.getOriginalFilename(), "image"))
                            .getFileName();

            Path filePath = uploadPath.resolve(fileName).normalize();

            if (!filePath.startsWith(uploadPath.normalize())) {
                throw new RuntimeException("Invalid image file name");
            }

            try {
                Files.copy(file.getInputStream(), filePath,
                        StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Could not save image: " + fileName, e);
            }

            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl("/uploads/products/" + id + "/" + fileName);
            image.setDisplayOrder(displayOrder++);

            ProductImage savedImage = productImageRepository.save(image);

            ProductImageResponse response = new ProductImageResponse();
            response.setId(savedImage.getId());
            response.setImageUrl(savedImage.getImageUrl());
            response.setDisplayOrder(savedImage.getDisplayOrder());
            responses.add(response);
        }

        return responses;
    }

    @Transactional
    public ProductImageResponse updateImage(
            Long productId,
            Long imageId,
            MultipartFile file) {

        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (!image.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Image does not belong to this product");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        Path uploadPath = Paths.get("uploads", "products", productId.toString());

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }

        String oldImageUrl = image.getImageUrl();

        if (oldImageUrl != null && !oldImageUrl.isBlank()) {
            Path oldFilePath = Paths.get(oldImageUrl.substring(1)).normalize();

            try {
                Files.deleteIfExists(oldFilePath);
            } catch (IOException e) {
                throw new RuntimeException("Could not delete old image", e);
            }
        }

        String fileName = UUID.randomUUID() + "_"
                + Paths.get(Objects.requireNonNullElse(
                        file.getOriginalFilename(), "image"))
                        .getFileName();

        Path newFilePath = uploadPath.resolve(fileName).normalize();

        if (!newFilePath.startsWith(uploadPath.normalize())) {
            throw new RuntimeException("Invalid image file name");
        }

        try {
            Files.copy(file.getInputStream(), newFilePath,
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Could not save new image", e);
        }

        image.setImageUrl("/uploads/products/" + productId + "/" + fileName);

        ProductImage updatedImage = productImageRepository.save(image);

        ProductImageResponse response = new ProductImageResponse();
        response.setId(updatedImage.getId());
        response.setImageUrl(updatedImage.getImageUrl());
        response.setDisplayOrder(updatedImage.getDisplayOrder());

        return response;
    }

    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product image not found"));

        if (!image.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Image does not belong to this product");
        }

        String imageUrl = image.getImageUrl();

        if (imageUrl != null && !imageUrl.isBlank()) {
            Path filePath = Paths.get(imageUrl.substring(1)).normalize();

            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Could not delete image file", e);
            }
        }

        productImageRepository.delete(image);
    }
}
