package com.adhiemb.module.product.dto;

import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequest(
        String title,
        String description,
        BigDecimal price,
        BigDecimal discountPrice,
        Integer stitchCount,
        BigDecimal widthMm,
        BigDecimal heightMm,
        Integer colorCount,
        Integer stopCount,
        Long categoryId,
        List<String> imageUrls
) {}
