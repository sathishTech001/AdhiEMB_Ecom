import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '../api/permissions.api';

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(),
  });
};

export const usePermissionsGrouped = () => {
  return useQuery({
    queryKey: ['permissions', 'grouped'],
    queryFn: () => permissionsApi.getGrouped(),
  });
};
