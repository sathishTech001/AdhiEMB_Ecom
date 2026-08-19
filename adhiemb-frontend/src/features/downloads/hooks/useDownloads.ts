import { useQuery, useMutation } from '@tanstack/react-query';
import { downloadsApi } from '../api/downloads.api';
import { MachineFormat } from '@/features/products/types/product.types';
import toast from 'react-hot-toast';

export const DOWNLOAD_QUERY_KEYS = {
  userDownloads: ['downloads', 'user'] as const,
};

export function useUserDownloads() {
  return useQuery({
    queryKey: DOWNLOAD_QUERY_KEYS.userDownloads,
    queryFn: async () => {
      const res = await downloadsApi.getUserDownloads();
      return res.data;
    },
  });
}

export function useDownloadUrl() {
  return useMutation({
    mutationFn: ({ productId, format }: { productId: string | number; format: MachineFormat }) =>
      downloadsApi.getDownloadUrl(productId, format),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to generate download token');
    },
  });
}
