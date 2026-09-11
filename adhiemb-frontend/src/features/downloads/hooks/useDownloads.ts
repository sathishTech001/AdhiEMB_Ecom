import { useQuery, useMutation } from '@tanstack/react-query';
import { downloadsApi } from '../api/downloads.api';
import toast from 'react-hot-toast';

export const DOWNLOAD_QUERY_KEYS = {
  userDownloads: ['downloads', 'user'] as const,
};

/**
 * Fetches all purchased file tokens for the current authenticated user.
 * Returns UserDownload[] — each product groups its purchased DownloadToken records.
 */
export function useUserDownloads() {
  return useQuery({
    queryKey: DOWNLOAD_QUERY_KEYS.userDownloads,
    queryFn: async () => {
      const res = await downloadsApi.getUserDownloads();
      // Backend returns PagedResponse: { content: UserDownload[], ... }
      return (res as any)?.data?.content ?? (res as any)?.data ?? [];
    },
  });
}

/**
 * Downloads a specific purchased machine file by its token string.
 * Backend streams the file as application/octet-stream.
 * On success: triggers a browser file download for the given filename.
 */
export function useDownloadFile() {
  return useMutation({
    mutationFn: async ({ token, fileName }: { token: string; fileName: string }) => {
      const blob = await downloadsApi.downloadFile(token);
      return { blob, fileName };
    },
    onSuccess: ({ blob, fileName }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Download failed. Please try again.');
    },
  });
}
