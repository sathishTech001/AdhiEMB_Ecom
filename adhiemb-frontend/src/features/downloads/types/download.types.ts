import { MachineFormat } from '@/features/products/types/product.types';

export interface UserDownload {
  id: string | number;
  orderId: string | number;
  orderNumber?: string;
  productId: string | number;
  productTitle: string;
  productSlug?: string;
  productImage?: string;
  stitchCount?: number;
  widthMm?: number;
  heightMm?: number;
  colorCount?: number;
  availableFormats: MachineFormat[];
  downloadCount: number;
  purchasedAt: string;
  lastDownloadedAt?: string;
}

export interface DownloadToken {
  token: string;
  url: string;
  expiresAt: string;
}
