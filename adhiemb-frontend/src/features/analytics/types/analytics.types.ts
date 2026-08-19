export interface AnalyticsSummary {
  totalRevenue: number;
  revenueGrowthPercentage: number;
  monthlySales: number;
  salesGrowthPercentage: number;
  activeDesigners: number;
  activeDesignersGrowth: number;
  conversionRate: number;
  conversionRateChange: number;
  totalOrders: number;
  totalDownloads: number;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  payouts: number;
  netProfit: number;
}

export interface TopProductSales {
  id: number | string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  price: number;
  downloadsCount: number;
  salesCount: number;
  totalRevenue: number;
  designerName: string;
}

export type PayoutStatus = 'PENDING' | 'PAID' | 'PROCESSING';

export interface DesignerPayout {
  id: number | string;
  designerId: number | string;
  designerName: string;
  designerEmail: string;
  avatarUrl?: string;
  totalSalesVolume: number;
  grossRevenue: number;
  commissionPercentage: number; // e.g. 70 for 70%
  designerEarnings: number;
  platformFee: number;
  status: PayoutStatus;
  payoutMethod: string;
  payoutDate?: string;
  period: string; // e.g. "July 2026"
}
