package com.adhiemb.module.coupon.dto;

import com.adhiemb.module.coupon.enums.DiscountType;

import java.math.BigDecimal;

public record CouponValidationResultDTO(
        boolean valid,
        String message,
        String code,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal calculatedDiscount
) {
}
