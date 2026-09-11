package com.adhiemb.module.product.dto;

import java.math.BigDecimal;

public record CreateProductFileRequest(
        String fileName,
        String originalFileName,
        String fileUrl,
        String filePath,
        String storageKey,
        String fileFormat,
        Long fileSize,
        Long fileSizeBytes,
        String machineInfo,
        BigDecimal price
) {}
