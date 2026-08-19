package com.adhiemb.module.auth.dto;

import com.adhiemb.module.user.dto.UserDTO;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UserDTO user
) {
}
