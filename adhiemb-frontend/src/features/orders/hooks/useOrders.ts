import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { CreateOrderData, OrderFilters, OrderStatus } from '../types/order.types';
import toast from 'react-hot-toast';

export const ORDER_QUERY_KEYS = {
  all: ['orders'] as const,
  userOrders: ['orders', 'user'] as const,
  byNumber: (orderNumber: string) => ['orders', 'number', orderNumber] as const,
  byId: (id: string | number) => ['orders', 'id', id] as const,
  admin: (filters?: OrderFilters) => ['orders', 'admin', filters] as const,
};

export function useUserOrders() {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.userOrders,
    queryFn: async () => {
      const res = await ordersApi.getUserOrders();
      return res.data;
    },
  });
}

export function useOrderByNumber(orderNumber?: string) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.byNumber(orderNumber || ''),
    queryFn: async () => {
      if (!orderNumber) return null;
      const res = await ordersApi.getByNumber(orderNumber);
      return res.data;
    },
    enabled: !!orderNumber,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create order');
    },
  });
}

export function useAdminOrders(params?: OrderFilters) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.admin(params),
    queryFn: async () => {
      const res = await ordersApi.getAllAdmin(params);
      return res.data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Order status updated to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update order status');
    },
  });
}
