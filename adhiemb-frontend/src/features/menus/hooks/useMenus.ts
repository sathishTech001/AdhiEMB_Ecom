import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menusApi } from '../api/menus.api';
import { CreateMenuData } from '../types/menu.types';
import toast from 'react-hot-toast';

export const useMenuTree = () => {
  return useQuery({
    queryKey: ['menus', 'tree'],
    queryFn: () => menusApi.getTree(),
  });
};

export const useMyMenus = () => {
  return useQuery({
    queryKey: ['menus', 'me'],
    queryFn: () => menusApi.getMyMenus(),
  });
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuData) => menusApi.create(data),
    onSuccess: () => {
      toast.success('Menu created successfully');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create menu');
    },
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateMenuData> }) => menusApi.update(id, data),
    onSuccess: () => {
      toast.success('Menu updated successfully');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update menu');
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => menusApi.remove(id),
    onSuccess: () => {
      toast.success('Menu deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete menu');
    },
  });
};
