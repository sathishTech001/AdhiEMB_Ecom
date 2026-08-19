export type MachineFormat = 'DST' | 'PES' | 'EXP' | 'JEF' | 'EMB' | 'VP3' | 'HUS' | 'XXX';

export type ProductStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface ProductImage {
  id?: string | number;
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductFile {
  id?: string | number;
  fileName: string;
  fileUrl: string;
  format: MachineFormat;
  fileSize?: number;
}

export interface Product {
  id: string | number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  status: ProductStatus;
  primaryImage?: string;
  images?: ProductImage[];
  categoryId: string | number;
  categoryName?: string;
  designerId?: string | number;
  designerName?: string;
  designerAvatar?: string;
  stitchCount: number;
  widthMm: number;
  heightMm: number;
  colorCount: number;
  stopCount: number;
  formats: MachineFormat[];
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  isFeatured?: boolean;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetail extends Product {
  files?: ProductFile[];
  compatibleBrands?: string[];
}

export interface CreateProductData {
  title: string;
  slug?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  categoryId: string | number;
  stitchCount: number;
  widthMm: number;
  heightMm: number;
  colorCount: number;
  stopCount: number;
  formats?: MachineFormat[];
  images?: string[] | ProductImage[];
  files?: ProductFile[];
  status?: ProductStatus;
}

export type UpdateProductData = Partial<CreateProductData>;

export interface ProductFilters {
  search?: string;
  categoryId?: string | number;
  status?: ProductStatus;
  format?: MachineFormat;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'popularity' | 'rating';
  page?: number;
  size?: number;
}

export interface ProductApprovalData {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}
