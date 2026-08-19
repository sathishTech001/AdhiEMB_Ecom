package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.MachineFormat;
import com.adhiemb.module.product.enums.ProductStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductDTO(
        Long id,
        String title,
        String slug,
        String description,
        BigDecimal price,
        BigDecimal discountPrice,
        Integer stitchCount,
        BigDecimal widthMm,
        BigDecimal heightMm,
        Integer colorCount,
        Integer stopCount,
        Long categoryId,
        String categoryName,
        String categorySlug,
        Long designerId,
        String designerName,
        ProductStatus status,
        String rejectionReason,
        Boolean isFeatured,
        Integer downloadsCount,
        Integer viewCount,
        BigDecimal ratingAverage,
        Integer ratingCount,
        String primaryImageUrl,
        List<MachineFormat> availableFormats,
        LocalDateTime createdAt
) {}
