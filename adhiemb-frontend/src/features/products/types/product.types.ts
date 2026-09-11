export type MachineFormat = 'DST' | 'PES' | 'EXP' | 'JEF' | 'EMB' | 'VP3' | 'HUS' | 'XXX';

export type ProductFileFormat = MachineFormat | 'ZIP';

export type ProductStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface ProductImage {
  id?: string | number;
  url?: string;
  imageUrl?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductFile {
  id?: string | number;
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
  storageKey?: string;
  fileUrl?: string;
  format?: ProductFileFormat | string;
  fileFormat?: MachineFormat | string;
  machineInfo?: string;
  price?: number;
  fileSize?: number;
  fileSizeBytes?: number;
  isActive?: boolean;
}

export const DESIGN_TYPES = [
  'Neck Design',
  'Border',
  'Lace',
  'Motif',
  'Allover',
  'Bridal',
  '3D',
  'Monogram',
  'Alphabet',
  'Religious',
  'Kids',
  'Animal',
  'Geometric',
  'Floral',
  'Other',
] as const;

export type DesignType = typeof DESIGN_TYPES[number];

export interface Product {
  id: string | number;
  title: string;
  productCode?: string;
  slug: string;
  description?: string;
  status: ProductStatus;
  primaryImage?: string;
  primaryImageUrl?: string;
  images?: ProductImage[];
  categoryId: string | number;
  categoryName?: string;
  designType?: string;
  designerId?: string | number;
  designerName?: string;
  designerAvatar?: string;
  stitchCount: number;
  widthMm: number;
  heightMm: number;
  colorCount: number;
  stopCount: number;
  formats?: MachineFormat[];
  availableFormats?: MachineFormat[];
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
  productCode?: string;
  slug?: string;
  description?: string;
  categoryId: string | number;
  designType?: string;
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
  categorySlug?: string;
  designType?: string;
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
