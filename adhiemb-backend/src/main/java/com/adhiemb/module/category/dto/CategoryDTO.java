package com.adhiemb.module.category.dto;

public record CategoryDTO(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        String icon,
        Long parentId,
        String parentName,
        Integer sortOrder,
        Boolean isActive
) {}
