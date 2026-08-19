package com.adhiemb.module.analytics.dto;

import java.math.BigDecimal;

public record AnalyticsSummaryDTO(
    BigDecimal totalRevenue,
    Long totalOrders,
    Long totalProducts,
    Long totalUsers,
    Long totalDesigners,
    Long totalDownloads,
    BigDecimal averageOrderValue
) {}
