package com.adhiemb.module.role.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateRoleRequest(
        @NotBlank(message = "Name is required")
        String name,
        
        @NotBlank(message = "Code is required")
        String code,
        
        String description,
        List<Long> permissionIds,
        List<Long> menuIds
) {
}
