import { apiClient } from '@/lib/axios';
import { Permission, PermissionGroup } from '../types/role.types';

export const permissionsApi = {
  getAll: async (): Promise<Permission[]> => {
    const response = await apiClient.get('/permissions');
    return response.data;
  },

  getGrouped: async (): Promise<PermissionGroup[]> => {
    const response = await apiClient.get('/permissions/grouped');
    return response.data;
  },
};
