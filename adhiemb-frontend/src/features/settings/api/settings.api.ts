import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { UpdateSettingData } from '../types/setting.types';

export const settingsApi = {
  getGroup: async (group: string): Promise<ApiResponse<Record<string, any>>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.SETTINGS}/group/${group}`);
    return data;
  },

  updateGroup: async (
    group: string,
    settings: UpdateSettingData
  ): Promise<ApiResponse<Record<string, any>>> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.SETTINGS}/group/${group}`, settings);
    return data;
  },
};
