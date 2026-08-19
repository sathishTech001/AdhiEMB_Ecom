package com.adhiemb.module.category.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank(message = "Category name is required")
        String name,
        String description,
        String imageUrl,
        String icon,
        Long parentId,
        Integer sortOrder
) {}
