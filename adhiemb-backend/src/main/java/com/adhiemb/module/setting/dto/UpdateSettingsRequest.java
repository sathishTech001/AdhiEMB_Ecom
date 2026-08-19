package com.adhiemb.module.setting.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record UpdateSettingsRequest(
    @NotNull(message = "Settings map cannot be null")
    Map<String, String> settings
) {}
