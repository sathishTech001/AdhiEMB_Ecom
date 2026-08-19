import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse } from '@/types/api.types';
import { Category, CategoryTree, CreateCategoryData, UpdateCategoryData } from '../types/category.types';

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const { data } = await apiClient.get(API_ENDPOINTS.CATEGORIES);
    return data;
  },

  getTree: async (): Promise<ApiResponse<CategoryTree[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.CATEGORIES}/tree`);
    return data;
  },

  getPublicTree: async (): Promise<ApiResponse<CategoryTree[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.PUBLIC_CATEGORIES}/tree`);
    return data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.CATEGORIES}/slug/${slug}`);
    return data;
  },

  create: async (categoryData: CreateCategoryData): Promise<ApiResponse<Category>> => {
    const { data } = await apiClient.post(API_ENDPOINTS.CATEGORIES, categoryData);
    return data;
  },

  update: async (id: string | number, categoryData: UpdateCategoryData): Promise<ApiResponse<Category>> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, categoryData);
    return data;
  },

  delete: async (id: string | number): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    return data;
  },
};
