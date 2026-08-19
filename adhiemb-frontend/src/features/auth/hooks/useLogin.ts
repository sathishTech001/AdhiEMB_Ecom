import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types/auth.types';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response) => {
      const authData = response.data as any;
      const token = authData?.accessToken || authData?.token;
      const user = authData?.user;
      if (token && user) {
        login(token, user);
        toast.success('Successfully logged in');
      } else {
        toast.error('Invalid login response from server');
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });
};
