package com.adhiemb.module.role.service;

import com.adhiemb.module.role.dto.PermissionDTO;
import com.adhiemb.module.role.mapper.PermissionMapper;
import com.adhiemb.module.role.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    @Transactional(readOnly = true)
    public List<PermissionDTO> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(PermissionMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, List<PermissionDTO>> getAllGroupedByModule() {
        return permissionRepository.findAll().stream()
                .map(PermissionMapper::toDTO)
                .collect(Collectors.groupingBy(PermissionDTO::module));
    }
}
