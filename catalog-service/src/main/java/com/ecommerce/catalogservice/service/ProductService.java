package com.ecommerce.catalogservice.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.stereotype.Service;
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

    public List<ProductResponse> getAllProducts(String category, BigDecimal minPrice, BigDecimal maxPrice) {

        List<Product> products = productRepository.findProduct(category, minPrice, maxPrice);

        return products.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return mapToResponse(product);
    }

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

        Product saveProduct = productRepository.save(product);

        return mapToResponse(saveProduct);
    }

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

        Product updatedProduct = productRepository.save(product);

        return mapToResponse(updatedProduct);
    }

    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {

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

    public List<ProductImageResponse> uploadImages(
            Long id,
            List<MultipartFile> files) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Create uploads/products/{productId} folder
        Path uploadPath = Paths.get(
                "uploads",
                "products",
                id.toString());

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory",
                    e);
        }

        List<ProductImageResponse> responses = new ArrayList<>();

        int displayOrder = product.getImages().stream()
                .map(ProductImage::getDisplayOrder)
                .filter(Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;

        for (MultipartFile file : files) {

            if (file.isEmpty()) {
                continue;
            }

            // Generate unique file name
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path filePath = uploadPath.resolve(fileName);

            // Save actual image to uploads folder
            try {
                Files.copy(
                        file.getInputStream(),
                        filePath,
                        StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException(
                        "Could not save image: " + fileName,
                        e);
            }

            // Save image information in database
            ProductImage image = new ProductImage();

            image.setProduct(product);

            image.setImageUrl(
                    "/uploads/products/" + id + "/" + fileName);

            image.setDisplayOrder(displayOrder++);

            ProductImage savedImage = productImageRepository.save(image);

            // Prepare response
            ProductImageResponse response = new ProductImageResponse();

            response.setId(savedImage.getId());
            response.setImageUrl(savedImage.getImageUrl());
            response.setDisplayOrder(
                    savedImage.getDisplayOrder());

            responses.add(response);
        }

        return responses;
    }

    public ProductImageResponse updateImage(Long productId, Long imageId, MultipartFile file) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // Make sure the image belongs to this product
        if (!image.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Image does not belong to this product");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Image file is required");
        }

        // Product image folder
        Path uploadPath = Paths.get(
                "uploads",
                "products",
                productId.toString());

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory",
                    e);
        }

        // Delete old physical image
        String oldImageUrl = image.getImageUrl();

        if (oldImageUrl != null && !oldImageUrl.isBlank()) {

            Path oldFilePath = Paths.get(
                    oldImageUrl.substring(1));

            try {
                Files.deleteIfExists(oldFilePath);
            } catch (IOException e) {
                throw new RuntimeException(
                        "Could not delete old image",
                        e);
            }
        }

        // Generate new unique filename
        String fileName = UUID.randomUUID()
                + "_" + file.getOriginalFilename();

        Path newFilePath = uploadPath.resolve(fileName);

        // Save new image
        try {
            Files.copy(
                    file.getInputStream(),
                    newFilePath,
                    StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not save new image",
                    e);
        }

        // Update database record
        image.setImageUrl(
                "/uploads/products/"
                        + productId
                        + "/"
                        + fileName);

        ProductImage updatedImage = productImageRepository.save(image);

        // Prepare response
        ProductImageResponse response = new ProductImageResponse();

        response.setId(updatedImage.getId());
        response.setImageUrl(updatedImage.getImageUrl());
        response.setDisplayOrder(
                updatedImage.getDisplayOrder());

        return response;
    }

    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product Image not found"));

        // Make sure this image belongs to the requested product
        if (!image.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Image does not belong to this product");
        }

        // Delete actual file from uploads folder
        String imageUrl = image.getImageUrl();

        if (imageUrl != null && !imageUrl.isBlank()) {

            Path filePath = Paths.get(
                    imageUrl.substring(1));

            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                throw new RuntimeException(
                        "Could not delete image file",
                        e);
            }
        }

        // Delete image record from database
        productImageRepository.delete(image);
    }
}
