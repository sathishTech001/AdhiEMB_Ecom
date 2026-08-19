import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse, PagedResponse } from '@/types/api.types';
import { User, UserFilters, CreateUserData, UpdateUserData } from '../types/user.types';

export const usersApi = {
  getAll: async (params: { page: number; size: number; search?: string } & Partial<UserFilters>): Promise<ApiResponse<PagedResponse<User>>> => {
    const { data } = await api.get(API_ENDPOINTS.USERS, { params });
    return data;
  },

  getById: async (id: number | string): Promise<ApiResponse<User>> => {
    const { data } = await api.get(`${API_ENDPOINTS.USERS}/${id}`);
    return data;
  },

  create: async (userData: CreateUserData): Promise<ApiResponse<User>> => {
    const { data } = await api.post(API_ENDPOINTS.USERS, userData);
    return data;
  },

  update: async (id: number | string, userData: UpdateUserData): Promise<ApiResponse<User>> => {
    const { data } = await api.put(`${API_ENDPOINTS.USERS}/${id}`, userData);
    return data;
  },

  updateStatus: async (id: number | string, status: string): Promise<ApiResponse<void>> => {
    const { data } = await api.patch(`${API_ENDPOINTS.USERS}/${id}/status`, { status });
    return data;
  },

  remove: async (id: number | string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`${API_ENDPOINTS.USERS}/${id}`);
    return data;
  },
};
