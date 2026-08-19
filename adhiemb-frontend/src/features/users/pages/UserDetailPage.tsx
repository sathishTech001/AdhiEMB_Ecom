import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useUserQuery, useUpdateUserStatus, useDeleteUser } from '../hooks/useUsers';
import toast from 'react-hot-toast';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUserQuery(id || '');
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">User not found</p>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
      await updateStatus.mutateAsync({ id: Number(user.id), status: newStatus });
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'blocked'} successfully`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(Number(user.id));
      toast.success('User deleted');
      navigate('/users');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Details</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-start space-x-6">
          <Avatar name={`${user.firstName} ${user.lastName}`} size="xl" />
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-slate-500">@{user.username}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                  {user.status}
                </Badge>
                <Badge variant="primary">{user.role}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.createdAt || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Login</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.lastLoginAt || 'N/A'}</p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
                Edit
              </Button>
              <Button
                variant={user.status === 'ACTIVE' ? 'danger' : 'primary'}
                leftIcon={<Shield className="h-4 w-4" />}
                onClick={handleToggleStatus}
                isLoading={updateStatus.isPending}
              >
                {user.status === 'ACTIVE' ? 'Block User' : 'Activate User'}
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={handleDelete}
                isLoading={deleteUser.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
