import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { RegisterData } from '../types/auth.types';
import toast from 'react-hot-toast';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registration successful. You can now login.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Registration failed. Please try again.');
    },
  });
};
