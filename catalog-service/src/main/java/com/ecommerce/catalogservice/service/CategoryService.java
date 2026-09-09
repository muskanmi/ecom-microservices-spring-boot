package com.ecommerce.catalogservice.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecommerce.catalogservice.dto.CategoryResponse;
import com.ecommerce.catalogservice.dto.CreateCategoryRequest;
import com.ecommerce.catalogservice.entity.Category;
import com.ecommerce.catalogservice.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponse createCategory(
            CreateCategoryRequest request) {

        Category category = new Category();

        category.setName(request.getName());

        if (request.getParentId() != null) {

            Category parent = categoryRepository
                    .findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));

            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CategoryResponse> getRootCategories() {

        return categoryRepository.findByParentIsNull()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CategoryResponse> getSubCategories(Long parentId) {

        return categoryRepository.findByParentId(parentId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CategoryResponse mapToResponse(Category category) {

        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());

        if (category.getParent() != null) {
            response.setParentId(
                    category.getParent().getId());
        }

        return response;
    }
}
