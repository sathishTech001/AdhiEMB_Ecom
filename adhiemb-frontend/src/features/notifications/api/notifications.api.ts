import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { AppNotification } from '../types/notification.types';

export const notificationsApi = {
  getAll: async (): Promise<ApiResponse<AppNotification[]>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS);
    return data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/unread-count`);
    return data;
  },

  markAsRead: async (id: number | string): Promise<ApiResponse<AppNotification>> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.NOTIFICATIONS}/mark-all-read`);
    return data;
  },
};
