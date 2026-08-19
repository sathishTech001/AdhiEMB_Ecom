import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmployeeForm } from '../components/EmployeeForm';

export function CreateEmployeePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Employee</h1>
          <p className="text-slate-500">Create a new employee record</p>
        </div>
      </div>
      <EmployeeForm />
    </div>
  );
}
