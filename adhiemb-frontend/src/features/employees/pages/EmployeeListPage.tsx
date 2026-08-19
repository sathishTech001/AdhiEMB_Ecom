import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import { useEmployeesQuery, useDeleteEmployee } from '../hooks/useEmployees';
import { Employee } from '../types/employee.types';
import toast from 'react-hot-toast';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: employeesData, isLoading } = useEmployeesQuery({ page, size: pageSize, search });
  const deleteEmployee = useDeleteEmployee();

  const columns: Column<Employee>[] = [
    { key: 'employeeId', label: 'Employee ID' },
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {row.user?.firstName} {row.user?.lastName}
        </span>
      ),
    },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.user?.status === 'ACTIVE' ? 'success' : 'default'}>
          {row.user?.status || 'N/A'}
        </Badge>
      ),
    },
    { key: 'joiningDate', label: 'Joining Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Dropdown
          trigger={<button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><MoreVertical className="h-4 w-4" /></button>}
          items={[
            { key: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(`/employees/${row.id}`) },
            { key: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleteId(row.id), danger: true },
          ]}
        />
      ),
    },
  ];

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteEmployee.mutateAsync(deleteId);
        toast.success('Employee deleted successfully');
      } catch {
        toast.error('Failed to delete employee');
      }
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
          <p className="text-slate-500">Manage your team members</p>
        </div>
        <Button onClick={() => navigate('/employees/create')} leftIcon={<Plus className="h-4 w-4" />}>
          Add Employee
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <SearchInput placeholder="Search employees..." value={search} onChange={setSearch} />
        </div>
        <DataTable<Employee>
          columns={columns}
          data={employeesData?.content || []}
          isLoading={isLoading}
          emptyStateTitle="No employees found"
          currentPage={page}
          totalPages={employeesData?.totalPages || 0}
          pageSize={pageSize}
          totalElements={employeesData?.totalElements || 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
        confirmLabel="Delete"
        isDanger
      />
    </div>
  );
}
