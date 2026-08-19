import React from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '../hooks/useRoles';
import { RolePermissionConfig } from '../components/RolePermissionConfig';
import { Spinner } from '@/components/ui/Spinner';

export const RoleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const roleId = parseInt(id || '0', 10);
  const { data: role, isLoading } = useRole(roleId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return <RolePermissionConfig initialRole={role} isEditMode={true} />;
};
