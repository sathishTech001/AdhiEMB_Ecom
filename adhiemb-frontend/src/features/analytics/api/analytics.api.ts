import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { AnalyticsSummary, RevenuePoint, TopProductSales, DesignerPayout } from '../types/analytics.types';

export const analyticsApi = {
  getSummary: async (): Promise<ApiResponse<AnalyticsSummary>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/summary`);
    return data;
  },

  getRevenueChart: async (period: string = '12m'): Promise<ApiResponse<RevenuePoint[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/revenue-chart`, {
      params: { period },
    });
    return data;
  },

  getTopProducts: async (limit: number = 5): Promise<ApiResponse<TopProductSales[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/top-products`, {
      params: { limit },
    });
    return data;
  },

  getDesignerPayouts: async (): Promise<ApiResponse<DesignerPayout[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ANALYTICS}/designer-payouts`);
    return data;
  },

  processPayout: async (payoutId: number | string): Promise<ApiResponse<DesignerPayout>> => {
    const { data } = await apiClient.post(`${API_ENDPOINTS.ANALYTICS}/designer-payouts/${payoutId}/process`);
    return data;
  },
};
