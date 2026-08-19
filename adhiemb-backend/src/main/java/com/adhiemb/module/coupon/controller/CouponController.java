package com.adhiemb.module.coupon.controller;

import com.adhiemb.common.ApiResponse;
import com.adhiemb.module.coupon.dto.CouponDTO;
import com.adhiemb.module.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    @PreAuthorize("hasAuthority('SETTING_VIEW') or hasAuthority('ORDER_VIEW')")
    public ApiResponse<List<CouponDTO>> getAllCoupons() {
        return ApiResponse.success(couponService.getAllCoupons());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SETTING_UPDATE')")
    public ApiResponse<CouponDTO> createCoupon(@RequestBody CouponDTO dto) {
        return ApiResponse.success("Coupon created", couponService.createCoupon(dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SETTING_UPDATE')")
    public ApiResponse<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ApiResponse.success("Coupon deleted", null);
    }
}
