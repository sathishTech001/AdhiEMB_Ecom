export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  parentId?: number | string | null;
  parentName?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  parentId?: number | string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;
