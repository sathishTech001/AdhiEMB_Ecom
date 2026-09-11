package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.MachineFormat;

import java.math.BigDecimal;

public record ProductFileDTO(
        Long id,
        String filePath,
        String storageKey,
        MachineFormat fileFormat,
        Long fileSizeBytes,
        String originalFileName,
        String machineInfo,
        BigDecimal price,
        Boolean isActive
) {}
