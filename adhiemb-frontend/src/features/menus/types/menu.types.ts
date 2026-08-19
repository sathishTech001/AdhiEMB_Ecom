export interface Menu {
  id: number;
  name: string;
  code: string;
  icon: string;
  path: string | null;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuTree extends Menu {
  children: MenuTree[];
}

export interface CreateMenuData {
  name: string;
  code: string;
  icon?: string;
  path?: string;
  parentId?: number;
  sortOrder?: number;
}
