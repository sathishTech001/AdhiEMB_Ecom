package com.adhiemb.module.setting.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.setting.dto.SystemSettingDTO;
import com.adhiemb.module.setting.dto.UpdateSettingsRequest;
import com.adhiemb.module.setting.service.SystemSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTING_VIEW')")
    public ApiResponse<List<SystemSettingDTO>> getAllSettings() {
        List<SystemSettingDTO> settings = systemSettingService.getAllSettings();
        return ApiResponse.success("All system settings retrieved successfully", settings);
    }

    @GetMapping("/group/{group}")
    @PreAuthorize("hasAuthority('SETTING_VIEW')")
    public ApiResponse<List<SystemSettingDTO>> getSettingsByGroup(@PathVariable String group) {
        List<SystemSettingDTO> settings = systemSettingService.getSettingsByGroup(group);
        return ApiResponse.success("Settings for group '" + group + "' retrieved successfully", settings);
    }

    @GetMapping("/key/{key}")
    @PreAuthorize("hasAuthority('SETTING_VIEW')")
    public ApiResponse<SystemSettingDTO> getSettingByKey(@PathVariable String key) {
        SystemSettingDTO setting = systemSettingService.getSettingByKey(key);
        return ApiResponse.success("Setting retrieved successfully", setting);
    }

    @PutMapping("/key/{key}")
    @PreAuthorize("hasAuthority('SETTING_UPDATE')")
    public ApiResponse<SystemSettingDTO> updateSetting(
            @PathVariable String key,
            @RequestParam String value) {
        SystemSettingDTO updated = systemSettingService.updateSetting(key, value);
        return ApiResponse.success("Setting updated successfully", updated);
    }

    @PutMapping
    @PreAuthorize("hasAuthority('SETTING_UPDATE')")
    public ApiResponse<List<SystemSettingDTO>> updateSettingsGroup(
            @Valid @RequestBody UpdateSettingsRequest request) {
        List<SystemSettingDTO> updatedList = systemSettingService.updateSettingsGroup(request);
        return ApiResponse.success("System settings updated successfully", updatedList);
    }
}
