package com.adhiemb.module.setting.dto;

import java.time.LocalDateTime;

public record SystemSettingDTO(
    Long id,
    String settingKey,
    String settingValue,
    String settingGroup,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
