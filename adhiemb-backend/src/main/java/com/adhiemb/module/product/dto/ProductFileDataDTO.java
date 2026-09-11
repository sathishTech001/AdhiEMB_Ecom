package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.MachineFormat;
import java.math.BigDecimal;

public record ProductFileDataDTO(
        Long id,
        String originalFileName,
        String storageKey,
        MachineFormat fileFormat,
        String machineInfo,
        BigDecimal price,
        Long fileSizeBytes,
        Boolean isActive
) {}
