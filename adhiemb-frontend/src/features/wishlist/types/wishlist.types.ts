import { Product } from '@/features/products/types/product.types';

export interface WishlistItem {
  id: number;
  userId: number;
  product: Product;
  createdAt: string;
}
