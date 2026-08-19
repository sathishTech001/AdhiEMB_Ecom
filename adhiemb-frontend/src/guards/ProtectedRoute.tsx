import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageLoader } from '@/components/feedback/PageLoader';

export function ProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleCode = user?.roleCode || (typeof user?.role === 'string' ? user.role : (user?.role as any)?.code);
  if (roleCode === 'CUST' || roleCode === 'CUSTOMER') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
