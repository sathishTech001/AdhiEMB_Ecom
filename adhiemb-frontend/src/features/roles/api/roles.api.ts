import { apiClient } from '@/lib/axios';
import { Role, CreateRoleData, UpdateRoleData } from '../types/role.types';
import { PagedResponse } from '@/types/api.types';

export const rolesApi = {
  getAll: async (params?: any): Promise<PagedResponse<Role>> => {
    const response = await apiClient.get('/roles', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  create: async (data: CreateRoleData): Promise<Role> => {
    const response = await apiClient.post('/roles', data);
    return response.data;
  },

  update: async (id: number, data: UpdateRoleData): Promise<Role> => {
    const response = await apiClient.put(`/roles/${id}`, data);
    return response.data;
  },

  duplicate: async (id: number, newCode: string, newName: string): Promise<Role> => {
    const response = await apiClient.post(`/roles/${id}/duplicate`, null, {
      params: { newCode, newName }
    });
    return response.data;
  },

  updateStatus: async (id: number, isActive: boolean): Promise<Role> => {
    const response = await apiClient.put(`/roles/${id}/status`, null, {
      params: { isActive }
    });
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  assignPermissions: async (roleId: number, permissionIds: number[]): Promise<void> => {
    await apiClient.put(`/roles/${roleId}/permissions`, { permissionIds });
  },

  assignMenus: async (roleId: number, menuIds: number[]): Promise<void> => {
    await apiClient.put(`/roles/${roleId}/menus`, { menuIds });
  },
};
