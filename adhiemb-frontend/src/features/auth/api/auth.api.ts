import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { AuthUser } from '../types/auth.types';

export const authApi = {
  login: async (credentials: any): Promise<ApiResponse<{ token: string; user: AuthUser }>> => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return data;
  },
  
  register: async (userData: any): Promise<ApiResponse<void>> => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return data;
  },
  
  me: async (): Promise<ApiResponse<AuthUser>> => {
    const { data } = await api.get(API_ENDPOINTS.AUTH.ME);
    return data;
  }
};
