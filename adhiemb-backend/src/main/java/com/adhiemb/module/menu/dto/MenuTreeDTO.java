package com.adhiemb.module.menu.dto;

import java.util.List;

public record MenuTreeDTO(
        Long id,
        String name,
        String code,
        String icon,
        String path,
        Integer sortOrder,
        Boolean isActive,
        List<MenuTreeDTO> children
) {
}
