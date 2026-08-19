export interface Permission {
  id: number;
  module: string;
  action: string;
  description: string;
  isActive: boolean;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  permissions: Permission[];
  menuIds: number[];
  createdAt: string;
}

export interface CreateRoleData {
  name: string;
  code: string;
  description?: string;
  permissionIds?: number[];
  menuIds?: number[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: number[];
  menuIds?: number[];
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}
