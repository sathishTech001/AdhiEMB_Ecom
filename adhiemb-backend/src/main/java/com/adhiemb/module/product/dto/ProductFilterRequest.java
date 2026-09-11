package com.adhiemb.module.product.dto;

import com.adhiemb.module.product.enums.MachineFormat;

import java.math.BigDecimal;

public record ProductFilterRequest(
        String search,
        Long categoryId,
        String categorySlug,
        String designType,
        MachineFormat format,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer minStitch,
        Integer maxStitch,
        Boolean featured,
        String sortBy,
        String sortDirection
) {}
