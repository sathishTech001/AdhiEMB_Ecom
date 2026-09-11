import { PaymentStatus } from '@/features/orders/types/order.types';

export interface Payment {
  id: number | string;
  orderId: number | string;
  orderNumber: string;
  paymentNumber?: string;
  transactionId?: string;
  customerName?: string;
  customerEmail?: string;
  gateway?: string;
  paymentMethod?: string;
  amount: number;
  currency: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  status: PaymentStatus | string;
  rawResponse?: string | object;
  createdAt: string;
  updatedAt?: string;
}

export interface InitiatePaymentData {
  orderId: number;
  paymentMethod: string;
}

export interface VerifyPaymentData {
  paymentNumber: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  status?: string;
}
