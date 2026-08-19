export interface AuditLog {
  id: number | string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'MODERATE' | 'PAYOUT';
  module: 'PRODUCTS' | 'USERS' | 'ORDERS' | 'REVIEWS' | 'PAYMENTS' | 'SETTINGS';
  description: string;
  ipAddress: string;
  timestamp: string;
  changes?: {
    before?: Record<string, any> | null;
    after?: Record<string, any> | null;
  };
}

export interface AuditLogFilters {
  user?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}
