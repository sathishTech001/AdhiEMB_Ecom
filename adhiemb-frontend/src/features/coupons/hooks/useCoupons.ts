import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../api/coupons.api';
import { Coupon } from '../types/coupon.types';
import toast from 'react-hot-toast';

export const COUPONS_QUERY_KEY = ['coupons'];

export function useCouponsQuery() {
  return useQuery({
    queryKey: COUPONS_QUERY_KEY,
    queryFn: async () => {
      const res = await couponsApi.getAll();
      return res.data || [];
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Coupon>) => couponsApi.create(data),
    onSuccess: () => {
      toast.success('Promo Coupon created!');
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to create promo coupon');
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => couponsApi.delete(id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to delete coupon');
    },
  });
}
