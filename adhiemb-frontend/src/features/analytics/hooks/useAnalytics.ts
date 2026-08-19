import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  summary: () => [...ANALYTICS_KEYS.all, 'summary'] as const,
  revenue: (period?: string) => [...ANALYTICS_KEYS.all, 'revenue', period] as const,
  topProducts: (limit?: number) => [...ANALYTICS_KEYS.all, 'topProducts', limit] as const,
  payouts: () => [...ANALYTICS_KEYS.all, 'payouts'] as const,
};

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.summary(),
    queryFn: () => analyticsApi.getSummary(),
  });
}

export function useRevenueChart(period: string = '12m') {
  return useQuery({
    queryKey: ANALYTICS_KEYS.revenue(period),
    queryFn: () => analyticsApi.getRevenueChart(period),
  });
}

export function useTopProducts(limit: number = 5) {
  return useQuery({
    queryKey: ANALYTICS_KEYS.topProducts(limit),
    queryFn: () => analyticsApi.getTopProducts(limit),
  });
}

export function useDesignerPayouts() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.payouts(),
    queryFn: () => analyticsApi.getDesignerPayouts(),
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutId: number | string) => analyticsApi.processPayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.payouts() });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.summary() });
    },
  });
}
