package com.adhiemb.module.menu.dto;

public record MenuDTO(
        Long id,
        String name,
        String code,
        String icon,
        String path,
        Long parentId,
        Integer sortOrder,
        Boolean isActive
) {
}
