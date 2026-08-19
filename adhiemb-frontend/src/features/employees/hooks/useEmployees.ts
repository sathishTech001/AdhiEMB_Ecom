import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { CreateEmployeeData, UpdateEmployeeData } from '../types/employee.types';
import toast from 'react-hot-toast';

export const useEmployeesQuery = (params?: any) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeesApi.getAll(params),
  });
};

export const useEmployeeQuery = (id: number) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeData) => employeesApi.create(data),
    onSuccess: () => {
      toast.success('Employee created successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create employee');
    },
  });
};

export const useUpdateEmployee = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeData) => employeesApi.update(id, data),
    onSuccess: () => {
      toast.success('Employee updated successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', id] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update employee');
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.remove(id),
    onSuccess: () => {
      toast.success('Employee deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete employee');
    },
  });
};
