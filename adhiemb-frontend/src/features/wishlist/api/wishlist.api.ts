import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { WishlistItem } from '../types/wishlist.types';

export const wishlistApi = {
  getWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
    const { data } = await api.get(API_ENDPOINTS.WISHLIST);
    return data;
  },

  addToWishlist: async (productId: number | string): Promise<ApiResponse<WishlistItem>> => {
    const { data } = await api.post(`${API_ENDPOINTS.WISHLIST}/${productId}`);
    return data;
  },

  removeFromWishlist: async (productId: number | string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`${API_ENDPOINTS.WISHLIST}/${productId}`);
    return data;
  },

  checkInWishlist: async (productId: number | string): Promise<ApiResponse<boolean>> => {
    const { data } = await api.get(`${API_ENDPOINTS.WISHLIST}/check/${productId}`);
    return data;
  },
};
