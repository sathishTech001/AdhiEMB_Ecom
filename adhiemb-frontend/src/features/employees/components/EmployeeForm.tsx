import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCreateEmployee } from '../hooks/useEmployees';
import toast from 'react-hot-toast';

const employeeSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Min 3 characters'),
  password: z.string().min(8, 'Min 8 characters'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  employeeId: z.string().min(1, 'Required'),
  department: z.string().min(1, 'Required'),
  designation: z.string().min(1, 'Required'),
  joiningDate: z.string().min(1, 'Required'),
  roleId: z.string().min(1, 'Required'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function EmployeeForm() {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee.mutateAsync({
        ...data,
        roleId: parseInt(data.roleId, 10),
      });
      toast.success('Employee created successfully');
      navigate('/employees');
    } catch {
      toast.error('Failed to create employee');
    }
  };

  const roleOptions = [
    { label: 'Admin', value: '2' },
    { label: 'Officer', value: '3' },
    { label: 'Designer', value: '4' },
  ];

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-3">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Email" type="email" name="email" register={register} error={errors.email?.message} />
          <FormField label="Username" name="username" register={register} error={errors.username?.message} />
          <FormField label="Password" type="password" name="password" register={register} error={errors.password?.message} />
          <FormSelect label="Role" name="roleId" register={register} error={errors.roleId?.message} options={roleOptions} />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="First Name" name="firstName" register={register} error={errors.firstName?.message} />
          <FormField label="Last Name" name="lastName" register={register} error={errors.lastName?.message} />
          <FormField label="Phone" name="phone" register={register} error={errors.phone?.message} />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-3">Employee Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Employee ID" name="employeeId" register={register} error={errors.employeeId?.message} />
          <FormField label="Department" name="department" register={register} error={errors.department?.message} />
          <FormField label="Designation" name="designation" register={register} error={errors.designation?.message} />
          <FormField label="Joining Date" type="date" name="joiningDate" register={register} error={errors.joiningDate?.message} />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" type="button" onClick={() => navigate('/employees')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Employee
          </Button>
        </div>
      </form>
    </Card>
  );
}
