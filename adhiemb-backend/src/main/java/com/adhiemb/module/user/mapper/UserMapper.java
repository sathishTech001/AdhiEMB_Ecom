package com.adhiemb.module.user.mapper;

import com.adhiemb.module.user.dto.CreateUserRequest;
import com.adhiemb.module.user.dto.UserDTO;
import com.adhiemb.module.user.entity.User;
import com.adhiemb.module.user.enums.UserStatus;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return new UserDTO(
                user.getId(),
                user.getCustomerUrn(),
                user.getEmail(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getStatus(),
                user.getRole() != null ? user.getRole().getId() : null,
                user.getRole() != null ? user.getRole().getName() : null,
                user.getRole() != null ? user.getRole().getCode() : null,
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public static User toEntity(CreateUserRequest request) {
        if (request == null) {
            return null;
        }

        return User.builder()
                .email(request.email())
                .username(request.username())
                .password(request.password())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .status(UserStatus.ACTIVE)
                .build();
    }
}
