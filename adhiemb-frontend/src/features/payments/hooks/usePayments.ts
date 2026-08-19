import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import { InitiatePaymentData, VerifyPaymentData } from '../types/payment.types';
import toast from 'react-hot-toast';

export const PAYMENT_QUERY_KEYS = {
  all: ['payments'] as const,
  admin: ['payments', 'admin'] as const,
};

export function useAdminPayments() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.admin,
    queryFn: async () => {
      const res = await paymentsApi.getAllAdmin();
      return res.data;
    },
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (data: InitiatePaymentData) => paymentsApi.initiate(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to initiate payment gateway');
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentData) => paymentsApi.verify(data),
    onSuccess: () => {
      toast.success('Payment verified successfully!');
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Payment verification failed');
    },
  });
}
