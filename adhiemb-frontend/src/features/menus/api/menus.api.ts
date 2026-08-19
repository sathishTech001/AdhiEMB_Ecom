import { apiClient } from '@/lib/axios';
import { Menu, MenuTree, CreateMenuData } from '../types/menu.types';

export const menusApi = {
  getAll: async (): Promise<Menu[]> => {
    const response = await apiClient.get('/menus');
    return response.data;
  },

  getTree: async (): Promise<MenuTree[]> => {
    const response = await apiClient.get('/menus/tree');
    return response.data;
  },

  getMyMenus: async (): Promise<MenuTree[]> => {
    const response = await apiClient.get('/menus/me');
    return response.data;
  },

  create: async (data: CreateMenuData): Promise<Menu> => {
    const response = await apiClient.post('/menus', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateMenuData>): Promise<Menu> => {
    const response = await apiClient.patch(`/menus/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/menus/${id}`);
  },
};
