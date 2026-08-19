import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageInput } from '@/components/ui/ImageInput';
import toast from 'react-hot-toast';
import { useCreateUser } from '../hooks/useUsers';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      await createUser.mutateAsync({
        ...data,
        roleId: parseInt(data.roleId, 10),
      });
      toast.success('User created successfully');
      navigate('/users');
    } catch {
      toast.error('Failed to create user');
    }
  };

  const roleOptions = [
    { label: 'Admin', value: '2' },
    { label: 'Officer', value: '3' },
    { label: 'Designer', value: '4' },
    { label: 'Customer (CUST)', value: '5' },
  ];

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Email"
            type="email"
            placeholder="user@example.com"
            name="email"
            register={register}
            error={errors.email?.message}
          />
          <FormField
            label="Username"
            placeholder="username"
            name="username"
            register={register}
            error={errors.username?.message}
          />
        </div>

        <FormField
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          name="password"
          register={register}
          error={errors.password?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            placeholder="John"
            name="firstName"
            register={register}
            error={errors.firstName?.message}
          />
          <FormField
            label="Last Name"
            placeholder="Doe"
            name="lastName"
            register={register}
            error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Phone"
            placeholder="+91-XXXXXXXXXX"
            name="phone"
            register={register}
            error={errors.phone?.message}
          />
          <FormSelect
            label="Role"
            name="roleId"
            register={register}
            error={errors.roleId?.message}
            options={roleOptions}
          />
        </div>

        <Controller
          name="avatarUrl"
          control={control}
          render={({ field }) => (
            <ImageInput
              label="User Profile Avatar"
              value={field.value}
              onChange={field.onChange}
              directory="users"
              error={errors.avatarUrl?.message}
              helpText="Upload avatar file from device or enter image URL"
            />
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" type="button" onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create User
          </Button>
        </div>
      </form>
    </Card>
  );
}
