import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';
import { CreateRoleData, UpdateRoleData } from '../types/role.types';
import toast from 'react-hot-toast';

export const useRoles = (params?: any) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => rolesApi.getAll(params),
  });
};

export const useRolesQuery = useRoles;

export const useRole = (id: number) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleData) => rolesApi.create(data),
    onSuccess: () => {
      toast.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role');
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleData }) => rolesApi.update(id, data),
    onSuccess: () => {
      toast.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    },
  });
};

export const useDuplicateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newCode, newName }: { id: number; newCode: string; newName: string }) => 
      rolesApi.duplicate(id, newCode, newName),
    onSuccess: () => {
      toast.success('Role duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to duplicate role');
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rolesApi.remove(id),
    onSuccess: () => {
      toast.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
    },
  });
};

export const useAssignPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) => 
      rolesApi.assignPermissions(roleId, permissionIds),
    onSuccess: (_, variables) => {
      toast.success('Permissions updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update permissions');
    },
  });
};

export const useAssignMenus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, menuIds }: { roleId: number; menuIds: number[] }) => 
      rolesApi.assignMenus(roleId, menuIds),
    onSuccess: (_, variables) => {
      toast.success('Menus updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update menus');
    },
  });
};
