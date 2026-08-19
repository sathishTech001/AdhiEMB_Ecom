package com.adhiemb.module.coupon.service;

import com.adhiemb.exception.ResourceNotFoundException;
import com.adhiemb.module.coupon.dto.CouponDTO;
import com.adhiemb.module.coupon.dto.CouponValidationResultDTO;
import com.adhiemb.module.coupon.entity.Coupon;
import com.adhiemb.module.coupon.enums.DiscountType;
import com.adhiemb.module.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CouponValidationResultDTO validateCoupon(String code, BigDecimal orderAmount) {
        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code);
        if (opt.isEmpty()) {
            return new CouponValidationResultDTO(false, "Invalid or expired promo code", code, null, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        Coupon coupon = opt.get();
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new CouponValidationResultDTO(false, "Promo code has expired", code, null, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return new CouponValidationResultDTO(false, "Promo code usage limit reached", code, null, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        if (coupon.getMinOrderAmount() != null && orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return new CouponValidationResultDTO(false, "Minimum order amount of $" + coupon.getMinOrderAmount() + " required", code, null, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return new CouponValidationResultDTO(true, "Promo code applied successfully!", coupon.getCode(), coupon.getDiscountType(), coupon.getDiscountValue(), discount);
    }

    @Transactional
    public CouponDTO createCoupon(CouponDTO dto) {
        Coupon coupon = Coupon.builder()
                .code(dto.code().toUpperCase())
                .discountType(dto.discountType() != null ? dto.discountType() : DiscountType.PERCENTAGE)
                .discountValue(dto.discountValue())
                .minOrderAmount(dto.minOrderAmount())
                .maxDiscountAmount(dto.maxDiscountAmount())
                .usageLimit(dto.usageLimit() != null ? dto.usageLimit() : 1000)
                .expiresAt(dto.expiresAt())
                .isActive(true)
                .build();

        coupon = couponRepository.save(coupon);
        return toDTO(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    private CouponDTO toDTO(Coupon coupon) {
        return new CouponDTO(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinOrderAmount(),
                coupon.getMaxDiscountAmount(),
                coupon.getUsageLimit(),
                coupon.getUsedCount(),
                coupon.getExpiresAt(),
                coupon.isActive()
        );
    }
}
