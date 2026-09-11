import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { UserDownload } from '../types/download.types';

export const downloadsApi = {
  /**
   * GET /api/downloads/my-downloads
   * Returns all purchased product files grouped by product, with one
   * DownloadToken per purchased ProductFileData.
   */
  getUserDownloads: async (): Promise<ApiResponse<{ content: UserDownload[] }>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.DOWNLOADS}/my-downloads`);
    return data;
  },

  /**
   * GET /api/downloads/file/{token}
   * Streams the actual machine file as an octet-stream Blob.
   * Backend validates: token ownership, expiry (null = lifetime), download limit (null = unlimited).
   */
  downloadFile: async (token: string): Promise<Blob> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.DOWNLOADS}/file/${token}`, {
      responseType: 'blob',
    });
    return data as Blob;
  },
};
