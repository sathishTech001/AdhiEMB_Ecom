package com.adhiemb.module.role.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.common.PagedResponse;
import com.adhiemb.module.role.dto.AssignMenusRequest;
import com.adhiemb.module.role.dto.AssignPermissionsRequest;
import com.adhiemb.module.role.dto.CreateRoleRequest;
import com.adhiemb.module.role.dto.RoleDTO;
import com.adhiemb.module.role.dto.UpdateRoleRequest;
import com.adhiemb.module.role.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ApiResponse<PagedResponse<RoleDTO>> getAllRoles(Pageable pageable) {
        return ApiResponse.success(roleService.getAllRoles(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ApiResponse<RoleDTO> getRoleById(@PathVariable Long id) {
        return ApiResponse.success(roleService.getRoleById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public ApiResponse<RoleDTO> createRole(@Valid @RequestBody CreateRoleRequest request) {
        return ApiResponse.success("Role created successfully", roleService.createRole(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_EDIT') || hasAuthority('ROLE_UPDATE') || hasAuthority('ROLE_MANAGE')")
    public ApiResponse<RoleDTO> updateRole(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        return ApiResponse.success("Role updated successfully", roleService.updateRole(id, request));
    }

    @PostMapping("/{id}/duplicate")
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public ApiResponse<RoleDTO> duplicateRole(@PathVariable Long id, @RequestParam String newCode, @RequestParam String newName) {
        return ApiResponse.success("Role duplicated successfully", roleService.duplicateRole(id, newCode, newName));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_EDIT') || hasAuthority('ROLE_UPDATE') || hasAuthority('ROLE_MANAGE')")
    public ApiResponse<RoleDTO> updateStatus(@PathVariable Long id, @RequestParam Boolean isActive) {
        return ApiResponse.success("Role status updated successfully", roleService.updateStatus(id, isActive));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public ApiResponse<Void> deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return ApiResponse.success("Role deleted successfully", null);
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ApiResponse<RoleDTO> assignPermissions(@PathVariable Long id, @Valid @RequestBody AssignPermissionsRequest request) {
        return ApiResponse.success("Permissions assigned successfully", roleService.assignPermissions(id, request.permissionIds()));
    }

    @PutMapping("/{id}/menus")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ApiResponse<RoleDTO> assignMenus(@PathVariable Long id, @Valid @RequestBody AssignMenusRequest request) {
        return ApiResponse.success("Menus assigned successfully", roleService.assignMenus(id, request.menuIds()));
    }
}
