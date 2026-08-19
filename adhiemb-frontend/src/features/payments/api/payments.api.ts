import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse, PagedResponse } from '@/types/api.types';
import { Payment, InitiatePaymentData, VerifyPaymentData } from '../types/payment.types';

export const paymentsApi = {
  initiate: async (data: InitiatePaymentData): Promise<ApiResponse<Payment>> => {
    const { data: responseData } = await apiClient.post(`${API_ENDPOINTS.PAYMENTS}/initiate`, data);
    return responseData;
  },

  verify: async (data: VerifyPaymentData): Promise<ApiResponse<Payment>> => {
    const { data: responseData } = await apiClient.post(`${API_ENDPOINTS.PAYMENTS}/verify`, data);
    return responseData;
  },

  getAllAdmin: async (): Promise<ApiResponse<Payment[] | PagedResponse<Payment>>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.PAYMENTS}/admin`);
    return data;
  },
};
