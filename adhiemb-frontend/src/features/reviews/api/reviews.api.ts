import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse, PagedResponse } from '@/types/api.types';
import { Review, CreateReviewData, ReviewFilters, ReviewStatus } from '../types/review.types';

export const reviewsApi = {
  getProductReviews: async (productId: number | string): Promise<ApiResponse<Review[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.PUBLIC_REVIEWS}/product/${productId}`);
    return data;
  },

  create: async (data: CreateReviewData): Promise<ApiResponse<Review>> => {
    const { data: responseData } = await apiClient.post(API_ENDPOINTS.REVIEWS, data);
    return responseData;
  },

  getAllAdmin: async (params?: ReviewFilters): Promise<ApiResponse<PagedResponse<Review>>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.REVIEWS}/admin`, { params });
    return data;
  },

  moderate: async (id: number | string, status: ReviewStatus): Promise<ApiResponse<Review>> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.REVIEWS}/${id}/status`, { status });
    return data;
  },

  delete: async (id: number | string): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`${API_ENDPOINTS.REVIEWS}/${id}`);
    return data;
  },
};
