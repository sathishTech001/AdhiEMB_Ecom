import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success && response.data) {
        const resData = response.data as any;
        const token = resData.accessToken || resData.token;
        const user = resData.user;
        if (token && user) {
          login(token, user);
          toast.success('Login successful!');
          const roleCode = user.roleCode || (typeof user.role === 'string' ? user.role : user.role?.code);
          if (roleCode === 'CUST' || roleCode === 'CUSTOMER') {
            navigate('/');
          } else {
            navigate('/dashboard');
          }
        } else {
          toast.error('Invalid response format from server');
        }
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        className="w-full h-12"
        leftIcon={<Mail className="h-5 w-5 text-slate-400" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        className="w-full h-12"
        leftIcon={<Lock className="h-5 w-5 text-slate-400" />}
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex flex-row items-center justify-between gap-2 text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
        </label>
        <a href="#" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-xs sm:text-sm">
          Forgot password?
        </a>
      </div>

      <div className="pt-2 flex justify-start">
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto h-12 px-8 font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </div>
    </form>
  );
}
