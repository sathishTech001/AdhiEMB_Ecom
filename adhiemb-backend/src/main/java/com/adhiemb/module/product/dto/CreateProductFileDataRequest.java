package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.MachineFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateProductFileDataRequest(
        @NotBlank(message = "Original file name is required")
        String originalFileName,

        String storageKey,

        String fileUrl,

        @NotNull(message = "Machine format is required")
        MachineFormat fileFormat,

        String machineInfo,

        @NotNull(message = "Price is required")
        BigDecimal price,

        Long fileSizeBytes
) {}
