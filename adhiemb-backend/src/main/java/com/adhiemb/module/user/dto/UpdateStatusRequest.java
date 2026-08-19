package com.adhiemb.module.user.dto;

import com.adhiemb.module.user.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Status is required")
        UserStatus status
) {
}
