export interface AuthUser {
  id: number | string;
  customerUrn?: string;
  email: string;
  username: string;
  firstName: string;
  lastName?: string;
  role: string | { id: number; name: string; code: string };
  roleCode?: string;
  permissions: string[];
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}
