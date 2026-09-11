import { MachineFormat } from '@/features/products/types/product.types';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string | number;
  productId: string | number;
  productTitle: string;
  productSlug?: string;
  productImage?: string;
  format?: MachineFormat;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string | number;
  orderNumber: string;
  userId: string | number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderItemInput {
  productId: string | number;
  quantity: number;
  selectedFormat?: MachineFormat;
}

export interface CreateOrderData {
  billingName: string;
  billingEmail: string;
  billingPhone?: string;
  billingAddress?: string;
  paymentMethod: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  page?: number;
  size?: number;
}
