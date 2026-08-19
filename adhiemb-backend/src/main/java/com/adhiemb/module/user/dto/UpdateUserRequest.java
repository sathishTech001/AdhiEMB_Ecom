package com.adhiemb.module.user.dto;

public record UpdateUserRequest(
        String firstName,
        String lastName,
        String phone,
        String avatarUrl,
        Long roleId
) {
}
