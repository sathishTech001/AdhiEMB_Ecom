package com.adhiemb.module.user.dto;

import com.adhiemb.module.user.enums.UserStatus;
import java.time.LocalDateTime;

public record UserDTO(
        Long id,
        String customerUrn,
        String email,
        String username,
        String firstName,
        String lastName,
        String phone,
        String avatarUrl,
        UserStatus status,
        Long roleId,
        String roleName,
        String roleCode,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
