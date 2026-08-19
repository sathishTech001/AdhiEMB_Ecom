import { Product, MachineFormat } from '@/features/products/types/product.types';

export interface CartItem {
  id: string | number;
  productId: string | number;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  price: number;
  quantity: number;
  selectedFormat?: MachineFormat;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountTotal?: number;
  grandTotal: number;
}

export interface AddToCartData {
  productId: string | number;
  quantity?: number;
  selectedFormat?: MachineFormat;
}
