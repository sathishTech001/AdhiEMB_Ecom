package com.adhiemb.module.category.dto;

public record UpdateCategoryRequest(
        String name,
        String description,
        String imageUrl,
        String icon,
        Long parentId,
        Integer sortOrder,
        Boolean isActive
) {}
