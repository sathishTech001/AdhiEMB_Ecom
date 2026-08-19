package com.adhiemb.module.category.dto;

import java.util.List;

public record CategoryTreeDTO(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        String icon,
        Integer sortOrder,
        Boolean isActive,
        List<CategoryTreeDTO> children
) {}
