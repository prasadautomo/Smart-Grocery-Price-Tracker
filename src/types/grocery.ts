export type UnitType = 'kg' | 'liter' | 'pcs' | 'pack' | 'botol' | 'kaleng' | 'bungkus' | 'gram';

export type CategoryType = 
  | 'Bahan Pokok' 
  | 'Bumbu & Dapur' 
  | 'Mandi & Kebersihan' 
  | 'Makanan & Camilan' 
  | 'Minuman' 
  | 'Kebutuhan Kamar' 
  | 'Lain-lain';

export type DiscountType = 'none' | 'single' | 'stacked' | 'nominal';

export interface GroceryItem {
  id: string;
  name: string;
  category: CategoryType;
  unit: UnitType;
  quantity: number;
  unitPrice: number;
  lastMonthPrice?: number | null;
  discountType: DiscountType;
  discountPercent1?: number; // e.g., 50 for 50%
  discountPercent2?: number; // e.g., 20 for +20%
  discountNominal?: number;  // e.g., Rp 15.000
  notes?: string;
  createdAt: string;
}

export interface ItemCalculatedPrice {
  baseTotal: number;         // quantity * unitPrice
  discountedUnitPrice: number; // final price per 1 unit after discount
  finalTotal: number;        // quantity * discountedUnitPrice
  totalDiscountAmount: number; // savings per item * quantity
  effectiveDiscountRate: number; // percentage savings
}

export type PriceTrend = 'up' | 'down' | 'equal' | 'new';

export interface PriceComparison {
  trend: PriceTrend;
  difference: number;        // current unit price - last month price
  percentChange: number;     // e.g., +15.5% or -10.0%
}

export interface ShoppingTrip {
  id: string;
  date: string;
  storeName: string;
  totalSpent: number;
  totalSavings: number;
  totalItemsCount: number;
  budgetLimit: number;
  itemsSnapshot: GroceryItem[];
  notes?: string;
}

export interface BudgetSettings {
  monthlyBudget: number;
  warningThresholdPercent: number; // default: 80 (%)
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface UnitComparisonResult {
  productA: {
    name: string;
    volume: number;
    unit: string;
    price: number;
    pricePerUnit: number;
  };
  productB: {
    name: string;
    volume: number;
    unit: string;
    price: number;
    pricePerUnit: number;
  };
  cheaperOption: 'A' | 'B' | 'EQUAL';
  savingsPercent: number;
  savingsNominalPerUnit: number;
}
