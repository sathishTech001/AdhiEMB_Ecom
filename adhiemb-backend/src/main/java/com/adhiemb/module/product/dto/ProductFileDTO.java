package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.MachineFormat;

public record ProductFileDTO(
        Long id,
        String filePath,
        MachineFormat fileFormat,
        Long fileSizeBytes,
        String originalFileName
) {}
