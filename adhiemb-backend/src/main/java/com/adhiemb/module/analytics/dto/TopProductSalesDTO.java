package com.adhiemb.module.analytics.dto;

import java.math.BigDecimal;

public record TopProductSalesDTO(
    Long productId,
    String productTitle,
    String categoryName,
    BigDecimal price,
    Long totalSalesCount,
    BigDecimal totalRevenue,
    BigDecimal ratingAverage
) {}
