import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';
import { ApiResponse, PagedResponse } from '@/types/api.types';
import { Order, CreateOrderData, OrderFilters, OrderStatus } from '../types/order.types';

export const ordersApi = {
  create: async (data: CreateOrderData): Promise<ApiResponse<Order>> => {
    const { data: responseData } = await apiClient.post(API_ENDPOINTS.ORDERS, data);
    return responseData;
  },

  getByNumber: async (orderNumber: string): Promise<ApiResponse<Order>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ORDERS}/${orderNumber}`);
    return data;
  },

  getById: async (id: string | number): Promise<ApiResponse<Order>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ORDERS}/${id}`);
    return data;
  },

  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ORDERS}/my-orders`);
    return data;
  },

  getAllAdmin: async (params?: OrderFilters): Promise<ApiResponse<PagedResponse<Order>>> => {
    const { data } = await apiClient.get(`${API_ENDPOINTS.ORDERS}/admin/all`, { params });
    return data;
  },

  updateStatus: async (id: string | number, status: OrderStatus): Promise<ApiResponse<Order>> => {
    const { data } = await apiClient.put(`${API_ENDPOINTS.ORDERS}/${id}/status`, { status });
    return data;
  },
};
