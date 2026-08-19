package com.adhiemb.module.coupon.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.coupon.dto.CouponValidationResultDTO;
import com.adhiemb.module.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/public/coupons")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public ApiResponse<CouponValidationResultDTO> validateCoupon(
            @RequestParam String code,
            @RequestParam(defaultValue = "0.00") BigDecimal amount
    ) {
        return ApiResponse.success(couponService.validateCoupon(code, amount));
    }
}
