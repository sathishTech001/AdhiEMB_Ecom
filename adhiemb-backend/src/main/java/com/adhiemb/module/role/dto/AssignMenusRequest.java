package com.adhiemb.module.role.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AssignMenusRequest(
        @NotNull(message = "Menu IDs cannot be null")
        List<Long> menuIds
) {
}
