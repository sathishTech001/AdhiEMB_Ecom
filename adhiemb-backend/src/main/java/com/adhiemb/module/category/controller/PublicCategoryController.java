package com.adhiemb.module.category.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.category.dto.CategoryDTO;
import com.adhiemb.module.category.dto.CategoryTreeDTO;
import com.adhiemb.module.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryDTO>> getActiveCategories() {
        return ApiResponse.success(categoryService.getAllActiveCategories());
    }

    @GetMapping("/tree")
    public ApiResponse<List<CategoryTreeDTO>> getActiveCategoryTree() {
        return ApiResponse.success(categoryService.getActiveCategoryTree());
    }

    @GetMapping("/{slug}")
    public ApiResponse<CategoryDTO> getCategoryBySlug(@PathVariable String slug) {
        return ApiResponse.success(categoryService.getCategoryBySlug(slug));
    }
}
