package com.adhiemb.module.role.dto;

import java.util.List;

public record UpdateRoleRequest(
        String name,
        String description,
        Boolean isActive,
        List<Long> permissionIds,
        List<Long> menuIds
) {
}
