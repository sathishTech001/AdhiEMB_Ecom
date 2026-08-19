package com.adhiemb.module.setting.service;

import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.setting.dto.SystemSettingDTO;
import com.adhiemb.module.setting.dto.UpdateSettingsRequest;
import com.adhiemb.module.setting.entity.SystemSetting;
import com.adhiemb.module.setting.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    @Transactional(readOnly = true)
    public List<SystemSettingDTO> getAllSettings() {
        return systemSettingRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SystemSettingDTO> getSettingsByGroup(String group) {
        return systemSettingRepository.findBySettingGroup(group.toUpperCase()).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public SystemSettingDTO getSettingByKey(String key) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "key", key));
        return mapToDTO(setting);
    }

    @Transactional
    public SystemSettingDTO updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .settingKey(key)
                        .settingGroup("GENERAL")
                        .build());

        setting.setSettingValue(value);
        SystemSetting saved = systemSettingRepository.save(setting);
        return mapToDTO(saved);
    }

    @Transactional
    public List<SystemSettingDTO> updateSettingsGroup(UpdateSettingsRequest request) {
        List<SystemSettingDTO> updatedList = new ArrayList<>();
        if (request.settings() != null) {
            for (Map.Entry<String, String> entry : request.settings().entrySet()) {
                updatedList.add(updateSetting(entry.getKey(), entry.getValue()));
            }
        }
        return updatedList;
    }

    private SystemSettingDTO mapToDTO(SystemSetting setting) {
        return new SystemSettingDTO(
                setting.getId(),
                setting.getSettingKey(),
                setting.getSettingValue(),
                setting.getSettingGroup(),
                setting.getDescription(),
                setting.getCreatedAt(),
                setting.getUpdatedAt()
        );
    }
}
