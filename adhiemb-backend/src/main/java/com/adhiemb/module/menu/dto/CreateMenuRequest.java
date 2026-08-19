package com.adhiemb.module.menu.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMenuRequest(
        @NotBlank(message = "Name is required")
        String name,
        
        @NotBlank(message = "Code is required")
        String code,
        
        String icon,
        String path,
        Long parentId,
        Integer sortOrder
) {
}
