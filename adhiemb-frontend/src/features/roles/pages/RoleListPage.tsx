import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Eye, Trash2, Shield } from 'lucide-react';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useRolesQuery, useDeleteRole } from '../hooks/useRoles';
import { Role } from '../types/role.types';
import toast from 'react-hot-toast';

export function RoleListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: rolesData, isLoading } = useRolesQuery({ page, size: pageSize });
  const deleteRole = useDeleteRole();

  const columns: Column<Role>[] = [
    {
      key: 'name',
      label: 'Role Name',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-indigo-500" />
          <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>
        </div>
      ),
    },
    { key: 'code', label: 'Code' },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (row) => (
        <Badge variant="primary">{row.permissions?.length || 0} permissions</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Dropdown
          trigger={<button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><MoreVertical className="h-4 w-4" /></button>}
          items={[
            { key: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(`/roles/${row.id}`) },
            { key: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleteId(row.id), danger: true },
          ]}
        />
      ),
    },
  ];

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteRole.mutateAsync(deleteId);
        toast.success('Role deleted');
      } catch {
        toast.error('Failed to delete role');
      }
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles</h1>
          <p className="text-slate-500">Manage access control roles</p>
        </div>
        <Button onClick={() => navigate('/roles/create')} leftIcon={<Plus className="h-4 w-4" />}>
          Create Role
        </Button>
      </div>

      <Card>
        <DataTable<Role>
          columns={columns}
          data={rolesData?.content || []}
          isLoading={isLoading}
          emptyStateTitle="No roles found"
          currentPage={page}
          totalPages={rolesData?.totalPages || 0}
          pageSize={pageSize}
          totalElements={rolesData?.totalElements || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Role"
        message="Are you sure? This will affect all users assigned to this role."
        confirmLabel="Delete"
        isDanger
      />
    </div>
  );
}
