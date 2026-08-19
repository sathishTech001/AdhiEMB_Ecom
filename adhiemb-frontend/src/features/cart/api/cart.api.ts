import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { Cart, AddToCartData } from '../types/cart.types';

export const cartApi = {
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.CART);
    return data;
  },

  addToCart: async (cartData: AddToCartData): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.post(`${API_ENDPOINTS.CART}/items`, cartData);
    return data;
  },


  updateQuantity: async (itemId: string | number, quantity: number): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.CART}/items/${itemId}`, { quantity });
    return data;
  },

  removeItem: async (itemId: string | number): Promise<ApiResponse<Cart>> => {
    const { data } = await apiClient.delete(`${API_ENDPOINTS.CART}/items/${itemId}`);
    return data;
  },

  clearCart: async (): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(API_ENDPOINTS.CART);
    return data;
  },
};
