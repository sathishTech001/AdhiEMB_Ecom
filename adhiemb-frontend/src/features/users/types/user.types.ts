import { UserStatus, BaseEntity } from '@/types/common.types';

export interface User extends BaseEntity {
  customerUrn?: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: UserStatus;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: string;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  roleId: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: number;
}
