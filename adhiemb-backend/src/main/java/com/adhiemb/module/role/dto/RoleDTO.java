package com.adhiemb.module.role.dto;

import java.util.List;

public record RoleDTO(
        Long id,
        String name,
        String code,
        String description,
        Boolean isActive,
        List<PermissionDTO> permissions,
        List<Long> menuIds
) {
}
