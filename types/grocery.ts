export type BudgetHealthStatus = 'SAFE' | 'WARNING' | 'DANGER';

export interface BasketAnalyticsItem {
  price: number;
  qty: number;
  category?: string;
  discountRaw?: string;
  lastMonthPrice?: number;
  inPhysicalCart?: boolean;
}

export interface BasketAnalyticsPayload {
  cart: BasketAnalyticsItem[];
  budgetLimit?: number;
}

export interface SmartBasketInsight {
  status: BudgetHealthStatus;
  healthScore: number;
  summary: string;
  inflationSummary: {
    totalItemsCompared: number;
    itemsIncreased: number;
    itemsDecreased: number;
    itemsStable: number;
    netInflationPct: number;
  };
  recommendations: Array<{
    type: 'WARNING' | 'SAVINGS' | 'SUBSTITUTION';
    title: string;
    description: string;
    estimatedSavings?: number;
  }>;
  categoryAllocation: Record<string, { spent: number; percentage: number }>;
  timestamp: string;
}
