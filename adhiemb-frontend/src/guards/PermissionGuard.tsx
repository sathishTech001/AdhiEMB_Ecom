import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: 'hidden' | 'redirect' | 'message';
  redirectTo?: string;
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = 'message',
  redirectTo = '/dashboard'
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, user } = useAuth();

  let hasAccess = false;

  // Simple override for Admins
  if (user?.role === 'ADMIN') {
    hasAccess = true;
  } else if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = permissions.every(p => hasPermission(p));
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Handle fallback
  if (fallback === 'hidden') {
    return null;
  }

  if (fallback === 'redirect') {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="max-w-md w-full">
        <EmptyState
          icon={<ShieldAlert className="h-8 w-8 text-red-500" />}
          title="Access Denied"
          description="You do not have the required permissions to view this content or perform this action."
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
