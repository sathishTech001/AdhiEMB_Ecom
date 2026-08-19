import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { Coupon, CouponValidationResult } from '../types/coupon.types';

export const couponsApi = {
  getAll: async (): Promise<ApiResponse<Coupon[]>> => {
    const { data } = await api.get(API_ENDPOINTS.COUPONS);
    return data;
  },

  create: async (couponData: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
    const { data } = await api.post(API_ENDPOINTS.COUPONS, couponData);
    return data;
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`${API_ENDPOINTS.COUPONS}/${id}`);
    return data;
  },

  validatePublic: async (code: string, amount: number): Promise<ApiResponse<CouponValidationResult>> => {
    const { data } = await api.get(`${API_ENDPOINTS.PUBLIC_COUPONS}/validate`, {
      params: { code, amount },
    });
    return data;
  },
};
