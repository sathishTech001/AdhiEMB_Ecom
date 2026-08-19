package com.adhiemb.module.role.dto;

public record PermissionDTO(
        Long id,
        String module,
        String action,
        String description,
        Boolean isActive
) {
}
