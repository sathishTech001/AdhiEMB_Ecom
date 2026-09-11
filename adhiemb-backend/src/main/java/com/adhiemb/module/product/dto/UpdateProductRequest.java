package com.adhiemb.module.product.dto;

import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequest(
        String title,
        String productCode,
        String description,
        Integer stitchCount,
        BigDecimal widthMm,
        BigDecimal heightMm,
        Integer colorCount,
        Integer stopCount,
        Long categoryId,
        String designType,
        List<String> imageUrls,
        List<CreateProductFileRequest> files
) {}
