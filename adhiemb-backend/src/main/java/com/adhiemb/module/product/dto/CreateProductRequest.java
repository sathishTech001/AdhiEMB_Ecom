package com.adhiemb.module.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
        @NotBlank(message = "Product title is required")
        String title,
        String description,
        @NotNull(message = "Price is required")
        BigDecimal price,
        BigDecimal discountPrice,
        Integer stitchCount,
        BigDecimal widthMm,
        BigDecimal heightMm,
        Integer colorCount,
        Integer stopCount,
        @NotNull(message = "Category is required")
        Long categoryId,
        List<String> imageUrls,
        List<Long> fileIds
) {}
