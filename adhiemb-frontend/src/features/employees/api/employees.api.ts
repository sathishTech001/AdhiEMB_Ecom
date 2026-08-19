import { apiClient } from '@/lib/axios';
import { PagedResponse } from '@/types/api.types';
import { Employee, CreateEmployeeData, UpdateEmployeeData } from '../types/employee.types';

export const employeesApi = {
  getAll: async (params?: any): Promise<PagedResponse<Employee>> => {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeData): Promise<Employee> => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  update: async (id: number, data: UpdateEmployeeData): Promise<Employee> => {
    const response = await apiClient.patch(`/employees/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};
