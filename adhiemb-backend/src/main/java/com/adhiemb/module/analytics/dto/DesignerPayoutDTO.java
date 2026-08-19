package com.adhiemb.module.analytics.dto;

import java.math.BigDecimal;

public record DesignerPayoutDTO(
    Long designerId,
    String designerName,
    String email,
    Long totalSalesCount,
    BigDecimal totalGrossRevenue,
    BigDecimal commissionRate,
    BigDecimal designerEarnings,
    String payoutStatus
) {}
