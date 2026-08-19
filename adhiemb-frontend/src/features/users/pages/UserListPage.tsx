import { useState } from 'react';
import { Plus, Eye, Edit, ShieldBan, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { User } from '../types/user.types';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export function UserListPage() {
  const [search, setSearch] = useState('');
  const { page, size, onPageChange, onPageSizeChange } = usePagination(10);
  
  // MOCK DATA for now since we don't have the full API hook running
  const mockUsers: User[] = [
    { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@adhiemb.com', username: 'admin', role: 'ADMIN', status: 'ACTIVE', lastLoginAt: new Date().toISOString(), createdAt: '', updatedAt: '' },
    { id: '2', firstName: 'John', lastName: 'Seller', email: 'john@example.com', username: 'john_seller', role: 'SELLER', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: '3', firstName: 'Jane', lastName: 'Customer', email: 'jane@example.com', username: 'jane_c', role: 'CUST', status: 'INACTIVE', createdAt: '', updatedAt: '' },
  ];

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (user) => (
        <div className="flex items-center space-x-3">
          <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} size="sm" />
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-slate-500">{user.username}</div>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user) => <UserStatusBadge status={user.status} />,
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (user) => (
        <span className="text-sm text-slate-500">
          {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (user) => (
        <Dropdown
          trigger={
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
              <span className="sr-only">Open menu</span>
              <span className="text-xl leading-none">&middot;&middot;&middot;</span>
            </Button>
          }
          items={[
            { key: 'view', label: 'View details', icon: <Eye />, onClick: () => {} },
            { key: 'edit', label: 'Edit user', icon: <Edit />, onClick: () => {} },
            { 
              key: 'block', 
              label: user.status === 'BLOCKED' ? 'Unblock user' : 'Block user', 
              icon: <ShieldBan />, 
              onClick: () => {}, 
              danger: user.status !== 'BLOCKED'
            },
            { key: 'delete', label: 'Delete user', icon: <Trash2 />, onClick: () => {}, danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all users across the platform.</p>
        </div>
        <Link to="/users/create">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Create User
          </Button>
        </Link>
      </div>

      <Card glass className="p-0 overflow-hidden border-none shadow-glass">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex justify-between items-center">
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder="Search users..." 
            className="w-full sm:w-72"
          />
        </div>
        
        <DataTable
          columns={columns}
          data={mockUsers}
          totalElements={mockUsers.length}
          totalPages={1}
          currentPage={page}
          pageSize={size}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          emptyStateTitle="No users found"
          emptyStateDescription="Try adjusting your search filters."
        />
      </Card>
    </div>
  );
}
