package com.adhiemb.module.role.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.role.dto.PermissionDTO;
import com.adhiemb.module.role.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ApiResponse<List<PermissionDTO>> getAllPermissions() {
        return ApiResponse.success(permissionService.getAllPermissions());
    }

    @GetMapping("/grouped")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    public ApiResponse<Map<String, List<PermissionDTO>>> getAllGroupedByModule() {
        return ApiResponse.success(permissionService.getAllGroupedByModule());
    }
}
