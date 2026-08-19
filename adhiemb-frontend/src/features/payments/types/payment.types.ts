import { PaymentStatus } from '@/features/orders/types/order.types';

export interface Payment {
  id: string | number;
  transactionId: string;
  orderId: string | number;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  gateway: 'RAZORPAY' | 'STRIPE' | 'TEST_CARD' | string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  rawResponse?: string | object;
  createdAt: string;
  updatedAt?: string;
}

export interface InitiatePaymentData {
  orderId: string | number;
  gateway: string;
}

export interface VerifyPaymentData {
  paymentId: string | number;
  transactionId: string;
  signature?: string;
}
