import { User } from '@/features/users/types/user.types';

export interface Employee {
  id: number;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  roleId: number;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  designation?: string;
}
