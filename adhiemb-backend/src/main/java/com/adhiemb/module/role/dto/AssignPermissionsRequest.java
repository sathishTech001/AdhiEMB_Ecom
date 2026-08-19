package com.adhiemb.module.role.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AssignPermissionsRequest(
        @NotNull(message = "Permission IDs cannot be null")
        List<Long> permissionIds
) {
}
