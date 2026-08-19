export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  message: string;
  code: string;
  discountType?: DiscountType;
  discountValue?: number;
  calculatedDiscount?: number;
}
