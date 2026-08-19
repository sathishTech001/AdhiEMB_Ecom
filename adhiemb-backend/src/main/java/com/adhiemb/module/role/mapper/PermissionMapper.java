package com.adhiemb.module.role.mapper;

import com.adhiemb.module.role.dto.PermissionDTO;
import com.adhiemb.module.role.entity.Permission;

public class PermissionMapper {

    public static PermissionDTO toDTO(Permission permission) {
        if (permission == null) {
            return null;
        }

        return new PermissionDTO(
                permission.getId(),
                permission.getModule(),
                permission.getAction(),
                permission.getDescription(),
                permission.getIsActive()
        );
    }
}
