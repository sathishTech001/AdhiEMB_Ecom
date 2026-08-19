package com.adhiemb.module.role.mapper;

import com.adhiemb.common.BaseEntity;
import com.adhiemb.module.role.dto.CreateRoleRequest;
import com.adhiemb.module.role.dto.RoleDTO;
import com.adhiemb.module.role.entity.Role;

import java.util.List;

public class RoleMapper {

    public static RoleDTO toDTO(Role role) {
        if (role == null) {
            return null;
        }

        List<Long> menuIds = role.getMenus() != null ? 
                role.getMenus().stream().map(BaseEntity::getId).toList() : 
                List.of();

        return new RoleDTO(
                role.getId(),
                role.getName(),
                role.getCode(),
                role.getDescription(),
                role.getIsActive(),
                role.getPermissions() != null ? role.getPermissions().stream().map(PermissionMapper::toDTO).toList() : List.of(),
                menuIds
        );
    }

    public static Role toEntity(CreateRoleRequest request) {
        if (request == null) {
            return null;
        }

        return Role.builder()
                .name(request.name())
                .code(request.code())
                .description(request.description())
                .isActive(true)
                .build();
    }
}
