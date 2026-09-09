export interface StatCardData {
  icon: string;
  iconBg: 'pink' | 'blue' | 'purple' | 'green';
  value: string;
  label: string;
  suffix?: string;
}

export type ListValueTone = 'neutral' | 'danger' | 'warning' | 'success';

export interface ListRowItem {
  title: string;
  subtitle?: string;
  value: string; 
  valueTone?: ListValueTone;
}

export interface OrdersStatusSlice {
  label: string;
  value: number;
  color: string;
}

export interface RevenuePoint {
  label: string;
  value: number;
}

export interface StatisticsResponse {
  summary: {
    totalProducts: number;
    totalOrders: number;
    totalCategories: number;
    totalRevenue: number;
    currency: string;
  };
  categories: Array<{
    id: string;
    title: string;
    productCount: number;
  }>;
  orderStatus: {
    completed: { count: number; percent: number };
    inProgress: { count: number; percent: number };
    canceled: { count: number; percent: number };
    totalOrders: number;
  };
  revenue: {
    period: string;
    points: Array<{
      period: string;
      label: string;
      revenue: number;
    }>;
  };
  topSellingProducts: Array<{
    productId: string;
    title: string;
    unitPrice: number;
    totalSales: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    title: string;
    stock: number;
  }>;
}

export const EMPTY_STATISTICS: StatisticsResponse = {
  summary: {
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalRevenue: 0,
    currency: 'EGP',
  },
  categories: [],
  orderStatus: {
    completed: { count: 0, percent: 0 },
    inProgress: { count: 0, percent: 0 },
    canceled: { count: 0, percent: 0 },
    totalOrders: 0,
  },
  revenue: { period: 'monthly', points: [] },
  topSellingProducts: [],
  lowStockProducts: [],
};
