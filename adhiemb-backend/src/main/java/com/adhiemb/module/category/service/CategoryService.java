package com.adhiemb.module.category.service;

import com.adhiemb.exception.BadRequestException;
import com.adhiemb.exception.DuplicateResourceException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.category.dto.CategoryDTO;
import com.adhiemb.module.category.dto.CategoryTreeDTO;
import com.adhiemb.module.category.dto.CreateCategoryRequest;
import com.adhiemb.module.category.dto.UpdateCategoryRequest;
import com.adhiemb.module.category.entity.Category;
import com.adhiemb.module.category.mapper.CategoryMapper;
import com.adhiemb.module.category.repository.CategoryRepository;
import com.adhiemb.storage.FstoreStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final com.adhiemb.module.product.repository.ProductRepository productRepository;
    private final FstoreStorageService fstoreStorageService;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(CategoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(CategoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryTreeDTO> getCategoryTree() {
        return categoryRepository.findByParentIsNullOrderBySortOrderAsc().stream()
                .map(CategoryMapper::toTreeDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryTreeDTO> getActiveCategoryTree() {
        return categoryRepository.findByParentIsNullAndIsActiveTrueOrderBySortOrderAsc().stream()
                .map(CategoryMapper::toActiveTreeDTO)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        return CategoryMapper.toDTO(category);
    }

    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryMapper.toDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CreateCategoryRequest request) {
        String baseSlug = generateSlug(request.name());
        String slug = baseSlug;
        int counter = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Category category = CategoryMapper.toEntity(request);
        category.setSlug(slug);

        if (StringUtils.hasText(request.imageUrl())) {
            String storedUrl = fstoreStorageService.processImageFromUrlOrUpload(request.imageUrl(), "categories");
            category.setImageUrl(storedUrl);
        }

        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found with id: " + request.parentId()));
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        return CategoryMapper.toDTO(savedCategory);
    }

    @Transactional
    public CategoryDTO updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (StringUtils.hasText(request.name()) && !category.getName().equals(request.name())) {
            category.setName(request.name());
            String baseSlug = generateSlug(request.name());
            String slug = baseSlug;
            int counter = 1;
            while (categoryRepository.existsBySlug(slug) && !slug.equals(category.getSlug())) {
                slug = baseSlug + "-" + counter++;
            }
            category.setSlug(slug);
        }

        if (request.description() != null) {
            category.setDescription(request.description());
        }

        if (request.imageUrl() != null) {
            String storedUrl = fstoreStorageService.processImageFromUrlOrUpload(request.imageUrl(), "categories");
            category.setImageUrl(storedUrl);
        }

        if (request.icon() != null) {
            category.setIcon(request.icon());
        }

        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        if (request.isActive() != null) {
            category.setIsActive(request.isActive());
        }

        if (request.parentId() != null) {
            if (request.parentId().equals(id)) {
                throw new BadRequestException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found with id: " + request.parentId()));
            category.setParent(parent);
        }

        Category updatedCategory = categoryRepository.save(category);
        return CategoryMapper.toDTO(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (categoryRepository.existsByParentId(id)) {
            throw new BadRequestException("Cannot delete category because it contains subcategories");
        }

        if (productRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Cannot delete category because it contains associated products");
        }

        if (StringUtils.hasText(category.getImageUrl())) {
            fstoreStorageService.deleteFile(category.getImageUrl());
        }

        categoryRepository.delete(category);
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
