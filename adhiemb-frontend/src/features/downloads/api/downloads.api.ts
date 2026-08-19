import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { UserDownload, DownloadToken } from '../types/download.types';
import { MachineFormat } from '@/features/products/types/product.types';

export const downloadsApi = {
  getUserDownloads: async (): Promise<ApiResponse<UserDownload[]>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.DOWNLOADS);
    return data;
  },

  getDownloadUrl: async (productId: string | number, format: MachineFormat): Promise<ApiResponse<DownloadToken>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.DOWNLOADS}/${productId}/url`, {
      params: { format },
    });
    return data;
  },
};
