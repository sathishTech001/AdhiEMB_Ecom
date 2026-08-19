package com.adhiemb.module.category.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.category.dto.CategoryDTO;
import com.adhiemb.module.category.dto.CategoryTreeDTO;
import com.adhiemb.module.category.dto.CreateCategoryRequest;
import com.adhiemb.module.category.dto.UpdateCategoryRequest;
import com.adhiemb.module.category.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public ApiResponse<List<CategoryDTO>> getAllCategories() {
        return ApiResponse.success(categoryService.getAllCategories());
    }

    @GetMapping("/tree")
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public ApiResponse<List<CategoryTreeDTO>> getCategoryTree() {
        return ApiResponse.success(categoryService.getCategoryTree());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    public ApiResponse<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return ApiResponse.success(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CATEGORY_CREATE')")
    public ApiResponse<CategoryDTO> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        return ApiResponse.success("Category created successfully", categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_UPDATE')")
    public ApiResponse<CategoryDTO> updateCategory(@PathVariable Long id, @RequestBody UpdateCategoryRequest request) {
        return ApiResponse.success("Category updated successfully", categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CATEGORY_DELETE')")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success("Category deleted successfully", null);
    }
}
