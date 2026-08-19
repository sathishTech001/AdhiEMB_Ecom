package com.adhiemb.module.role.service;

import com.adhiemb.common.PagedResponse;
import com.adhiemb.exception.DuplicateResourceException;
import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.menu.entity.Menu;
import com.adhiemb.module.menu.repository.MenuRepository;
import com.adhiemb.module.role.dto.CreateRoleRequest;
import com.adhiemb.module.role.dto.RoleDTO;
import com.adhiemb.module.role.dto.UpdateRoleRequest;
import com.adhiemb.module.role.entity.Permission;
import com.adhiemb.module.role.entity.Role;
import com.adhiemb.module.role.mapper.RoleMapper;
import com.adhiemb.module.role.repository.PermissionRepository;
import com.adhiemb.module.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final MenuRepository menuRepository;

    @Transactional(readOnly = true)
    public PagedResponse<RoleDTO> getAllRoles(Pageable pageable) {
        Page<Role> roles = roleRepository.findAll(pageable);
        return PagedResponse.of(roles.map(RoleMapper::toDTO));
    }

    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long id) {
        return roleRepository.findById(id)
                .map(RoleMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
    }

    @Transactional
    public RoleDTO createRole(CreateRoleRequest request) {
        if (roleRepository.existsByCode(request.code())) {
            throw new DuplicateResourceException("Role", "code", request.code());
        }
        if (roleRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Role", "name", request.name());
        }

        Role role = RoleMapper.toEntity(request);
        
        if (request.permissionIds() != null && !request.permissionIds().isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllById(request.permissionIds());
            role.setPermissions(permissions);
        }

        if (request.menuIds() != null && !request.menuIds().isEmpty()) {
            List<Menu> menus = menuRepository.findAllById(request.menuIds());
            role.setMenus(menus);
        }

        role = roleRepository.save(role);
        return RoleMapper.toDTO(role);
    }

    @Transactional
    public RoleDTO updateRole(Long id, UpdateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (request.name() != null && !request.name().equals(role.getName())) {
            if (roleRepository.existsByName(request.name())) {
                throw new DuplicateResourceException("Role", "name", request.name());
            }
            role.setName(request.name());
        }
        
        if (request.description() != null) {
            role.setDescription(request.description());
        }
        
        if (request.isActive() != null) {
            role.setIsActive(request.isActive());
        }

        if (request.permissionIds() != null) {
            List<Permission> permissions = permissionRepository.findAllById(request.permissionIds());
            role.setPermissions(permissions);
        }

        if (request.menuIds() != null) {
            List<Menu> menus = menuRepository.findAllById(request.menuIds());
            role.setMenus(menus);
        }

        role = roleRepository.save(role);
        return RoleMapper.toDTO(role);
    }

    @Transactional
    public RoleDTO duplicateRole(Long id, String newCode, String newName) {
        Role sourceRole = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (roleRepository.existsByCode(newCode)) {
            throw new DuplicateResourceException("Role", "code", newCode);
        }
        if (roleRepository.existsByName(newName)) {
            throw new DuplicateResourceException("Role", "name", newName);
        }

        Role newRole = Role.builder()
                .name(newName)
                .code(newCode)
                .description("Copy of " + sourceRole.getName() + " - " + (sourceRole.getDescription() != null ? sourceRole.getDescription() : ""))
                .isActive(true)
                .permissions(new ArrayList<>(sourceRole.getPermissions()))
                .menus(new ArrayList<>(sourceRole.getMenus()))
                .build();

        newRole = roleRepository.save(newRole);
        return RoleMapper.toDTO(newRole);
    }

    @Transactional
    public RoleDTO updateStatus(Long id, Boolean isActive) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        role.setIsActive(isActive);
        role = roleRepository.save(role);
        return RoleMapper.toDTO(role);
    }

    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        // Safeguard system roles from deletion
        String code = role.getCode();
        if ("OWNER".equalsIgnoreCase(code) || "ADMIN".equalsIgnoreCase(code) || "EMPLOYEE".equalsIgnoreCase(code) || "DESIGNER".equalsIgnoreCase(code) || "CUST".equalsIgnoreCase(code)) {
            throw new IllegalArgumentException("System role '" + code + "' cannot be deleted.");
        }

        roleRepository.delete(role);
    }

    @Transactional
    public RoleDTO assignPermissions(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
        
        List<Permission> permissions = permissionRepository.findAllById(permissionIds);
        role.setPermissions(permissions);
        
        role = roleRepository.save(role);
        return RoleMapper.toDTO(role);
    }

    @Transactional
    public RoleDTO assignMenus(Long roleId, List<Long> menuIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
        
        List<Menu> menus = menuRepository.findAllById(menuIds);
        role.setMenus(menus);
        
        role = roleRepository.save(role);
        return RoleMapper.toDTO(role);
    }

    @Transactional
    public void revokeAllPermissions(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
        role.setPermissions(new ArrayList<>());
        roleRepository.save(role);
    }

    @Transactional
    public void revokeAllMenus(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
        role.setMenus(new ArrayList<>());
        roleRepository.save(role);
    }
}
