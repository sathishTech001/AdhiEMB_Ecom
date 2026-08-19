package com.adhiemb.module.menu.dto;

public record UpdateMenuRequest(
        String name,
        String icon,
        String path,
        Long parentId,
        Integer sortOrder,
        Boolean isActive
) {
}
