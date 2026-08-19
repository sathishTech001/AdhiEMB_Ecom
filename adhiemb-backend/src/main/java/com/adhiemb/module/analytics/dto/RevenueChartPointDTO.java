package com.adhiemb.module.analytics.dto;

import java.math.BigDecimal;

public record RevenueChartPointDTO(
    String date,
    BigDecimal revenue,
    Long orderCount
) {}
