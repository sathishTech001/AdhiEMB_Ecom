export type NotificationType = 'ORDER' | 'PAYMENT' | 'REVIEW' | 'SYSTEM' | 'DESIGNER';

export interface AppNotification {
  id: number | string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
  userId?: number | string;
}
