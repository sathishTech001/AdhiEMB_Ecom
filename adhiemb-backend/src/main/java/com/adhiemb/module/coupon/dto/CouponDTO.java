package com.adhiemb.module.coupon.dto;

import com.adhiemb.module.coupon.enums.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CouponDTO(
        Long id,
        String code,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        BigDecimal maxDiscountAmount,
        Integer usageLimit,
        Integer usedCount,
        LocalDateTime expiresAt,
        boolean isActive
) {
}
