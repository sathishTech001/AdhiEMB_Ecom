package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
        @NotBlank(message = "Product title is required")
        String title,
        @NotBlank(message = "Product code is required")
        String productCode,
        String description,
        Integer stitchCount,
        BigDecimal widthMm,
        BigDecimal heightMm,
        Integer colorCount,
        Integer stopCount,
        @NotNull(message = "Category is required")
        Long categoryId,
        String designType,
        ProductStatus status,
        List<String> imageUrls,
        List<CreateProductFileRequest> files,
        List<Long> fileIds
) {}
