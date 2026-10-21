import type {
  GroceryItem,
  ShoppingTrip,
  BudgetSettings,
} from '../types/grocery';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  ITEMS: 'smart_grocery_items_v1',
  HISTORY: 'smart_grocery_history_v1',
  BUDGET: 'smart_grocery_budget_v1',
  BENCHMARKS: 'smart_grocery_benchmarks_v1',
};

// Data Awal Realistis Sesuai Kasus Rian & Katalog Astro (astronauts.id)
export const INITIAL_ITEMS: GroceryItem[] = [
  {
    id: 'item-1',
    name: 'Bundle Beras Ramos Astro 5kg + Indomie',
    category: 'Bahan Pokok',
    unit: 'pack',
    quantity: 1,
    unitPrice: 88799,
    lastMonthPrice: 91300, // Turun hemat!
    discountType: 'nominal',
    discountNominal: 2501,
    priority: 'essential',
    isCheckedInCart: true,
    notes: 'Kebutuhan pokok nasi 1 bulan kos via Astro Goods',
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/10/Untitled20261015T103343658_f2c66217-cdc9-4eee-9880-99267097b786_400x400.png',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-2',
    name: 'Minyak Goreng Sawit (2 Liter)',
    category: 'Bumbu & Dapur',
    unit: 'botol',
    quantity: 1,
    unitPrice: 34000,
    lastMonthPrice: 38000, // Turun Rp 4.000 (indikator hijau hemat!)
    discountType: 'single',
    discountPercent1: 10, // Promo potongan 10%
    priority: 'essential',
    isCheckedInCart: true,
    notes: 'Untuk masak lauk kos',
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/RestockBahanWajibdiDapur_04b8c552-e833-4f30-b13c-e09a7d5ea68e_400x400.jpg',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    name: 'Telur Ayam Negeri Astro Farm',
    category: 'Telur, Tahu & Tempe',
    unit: 'pack',
    quantity: 1,
    unitPrice: 28500,
    lastMonthPrice: 28500, // Stabil sama (indikator abu-abu =)
    discountType: 'none',
    priority: 'essential',
    isCheckedInCart: false,
    notes: 'Lauk protein harian terjamin segar',
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/TelurAyamNegeriAstroFarm1_55ce9dfb-31de-4afb-b36d-1ea35f75105c_400x400.jpg',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    name: 'Sabun Pembersih Lantai (800 ml)',
    category: 'Mandi & Kebersihan',
    unit: 'botol',
    quantity: 1,
    unitPrice: 24000,
    lastMonthPrice: 22000,
    discountType: 'stacked',
    discountPercent1: 50,
    discountPercent2: 20, // Kasus studi: Diskon 50% + 20%
    priority: 'optional',
    isCheckedInCart: false,
    notes: 'Promo cuci gudang bertingkat',
    imageUrl: 'https://image.astronauts.cloud/homepage-category/2026/10/cattiles02_85172688-a7e5-413d-84bd-f2d96f715791_239x306.png',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-5',
    name: 'Samyang Hot Ramen Carbonara Cup',
    category: 'Bahan Pokok',
    unit: 'cup',
    quantity: 3,
    unitPrice: 19800,
    lastMonthPrice: 19800,
    discountType: 'none',
    priority: 'essential',
    isCheckedInCart: false,
    notes: 'Cadangan makanan cepat saji akhir bulan',
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/AL20260911T092823558_a46bd4e1-8c9c-48ad-983e-394efe2f41ce_400x400.png',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-6',
    name: 'Keripik Kentang Balado (68g)',
    category: 'Makanan & Camilan',
    unit: 'bungkus',
    quantity: 2,
    unitPrice: 13500,
    lastMonthPrice: 13000,
    discountType: 'none',
    priority: 'optional',
    isCheckedInCart: false,
    notes: 'Camilan jajan nonton film (Opsional)',
    imageUrl: 'https://image.astronauts.cloud/homepage-category/2026/10/snack_04b0794c-7746-4167-bd41-a9c2fb123862_239x306.jpg',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
];


export const INITIAL_BUDGET: BudgetSettings = {
  monthlyBudget: 350000, // Jatah ketat belanja bulanan Rian
  warningThresholdPercent: 80,
};

export const INITIAL_HISTORY: ShoppingTrip[] = [
  {
    id: 'trip-prev-month',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    storeName: 'Grosir Indo Makmur',
    totalSpent: 315000,
    totalSavings: 28500,
    totalItemsCount: 5,
    budgetLimit: 350000,
    itemsSnapshot: [
      {
        id: 'old-1',
        name: 'Beras Ramos Super (5 kg)',
        category: 'Bahan Pokok',
        unit: 'pack',
        quantity: 1,
        unitPrice: 73000,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'old-2',
        name: 'Minyak Goreng Sawit (2 Liter)',
        category: 'Bumbu & Dapur',
        unit: 'liter',
        quantity: 1,
        unitPrice: 38000,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'old-3',
        name: 'Telur Ayam Negeri (1 kg)',
        category: 'Bahan Pokok',
        unit: 'kg',
        quantity: 1,
        unitPrice: 28500,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'old-4',
        name: 'Sabun Pembersih Lantai (800 ml)',
        category: 'Mandi & Kebersihan',
        unit: 'botol',
        quantity: 1,
        unitPrice: 22000,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'old-5',
        name: 'Deterjen Bubuk Konsentrat (1 kg)',
        category: 'Mandi & Kebersihan',
        unit: 'pack',
        quantity: 1,
        unitPrice: 24500,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
    ],
    notes: 'Struk Belanja Bulan Lalu (Data Resmi Pembanding)',
  },
];

/**
 * Memuat item belanja aktif
 */
export function loadGroceryItems(): GroceryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage items:', e);
  }
  // Simpan seed awal
  saveGroceryItems(INITIAL_ITEMS);
  return INITIAL_ITEMS;
}

/**
 * Menyimpan item belanja aktif ke LocalStorage & Supabase jika aktif
 */
export async function saveGroceryItems(items: GroceryItem[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items to localStorage:', e);
  }

  // Sync ke Supabase secara background
  const client = getSupabaseClient();
  if (client) {
    try {
      // Hapus & timpa keranjang saat ini
      await client.from('grocery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (items.length > 0) {
        const records = items.map((i) => ({
          name: i.name,
          category: i.category,
          unit: i.unit,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          last_month_price: i.lastMonthPrice || null,
          discount_type: i.discountType,
          discount_percent_1: i.discountPercent1 || 0,
          discount_percent_2: i.discountPercent2 || 0,
          discount_nominal: i.discountNominal || 0,
          notes: i.notes || '',
        }));
        await client.from('grocery_items').insert(records);
      }
    } catch (err) {
      console.warn('Sync grocery items to Supabase background error:', err);
    }
  }
}

/**
 * Memuat Riwayat Belanja
 */
export function loadShoppingHistory(): ShoppingTrip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading history:', e);
  }
  saveShoppingHistory(INITIAL_HISTORY);
  return INITIAL_HISTORY;
}

/**
 * Menyimpan Riwayat Belanja ke LocalStorage & Supabase
 */
export async function saveShoppingHistory(trips: ShoppingTrip[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trips));
  } catch (e) {
    console.error('Error saving history to localStorage:', e);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      // Upsert trips
      for (const trip of trips) {
        await client.from('shopping_trips').upsert({
          id: trip.id.includes('-') && trip.id.length === 36 ? trip.id : undefined,
          store_name: trip.storeName,
          trip_date: trip.date,
          total_spent: trip.totalSpent,
          total_savings: trip.totalSavings,
          total_items_count: trip.totalItemsCount,
          budget_limit: trip.budgetLimit,
          items_snapshot: trip.itemsSnapshot,
          notes: trip.notes || '',
        });
      }
    } catch (err) {
      console.warn('Sync history to Supabase error:', err);
    }
  }
}

/**
 * Memuat Pengaturan Anggaran
 */
export function loadBudgetSettings(): BudgetSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading budget settings:', e);
  }
  return INITIAL_BUDGET;
}

/**
 * Menyimpan Pengaturan Anggaran ke LocalStorage & Supabase
 */
export async function saveBudgetSettings(settings: BudgetSettings): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving budget settings:', e);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('user_budget_settings').upsert({
        id: 'default_user',
        monthly_budget: settings.monthlyBudget,
        warning_threshold_percent: settings.warningThresholdPercent,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Sync budget to Supabase error:', err);
    }
  }
}

/**
 * Memuat daftar patokan harga bulan lalu berdasarkan nama barang
 */
export function getHistoricalBenchmarkPrice(productName: string): number | null {
  const history = loadShoppingHistory();
  const lowerName = productName.trim().toLowerCase();

  for (const trip of history) {
    const found = trip.itemsSnapshot.find(
      (item) => item.name.trim().toLowerCase() === lowerName
    );
    if (found && found.unitPrice > 0) {
      return found.unitPrice;
    }
  }

  // Cek juga dari item awal
  const initMatch = INITIAL_ITEMS.find(
    (item) => item.name.trim().toLowerCase() === lowerName
  );
  if (initMatch?.lastMonthPrice) {
    return initMatch.lastMonthPrice;
  }

  return null;
}

/**
 * Tarik data terbaru dari Supabase ke LocalStorage (Pull Sync)
 */
export async function pullDataFromSupabase(): Promise<{
  success: boolean;
  message: string;
  itemsCount?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client belum terkonfigurasi!' };
  }

  try {
    // 1. Tarik items
    const { data: itemsData, error: itemsError } = await client
      .from('grocery_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    let itemsCount = 0;
    if (itemsData && itemsData.length > 0) {
      const mappedItems: GroceryItem[] = itemsData.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        unit: row.unit,
        quantity: Number(row.quantity),
        unitPrice: Number(row.unit_price),
        lastMonthPrice: row.last_month_price ? Number(row.last_month_price) : null,
        discountType: row.discount_type || 'none',
        discountPercent1: Number(row.discount_percent_1 || 0),
        discountPercent2: Number(row.discount_percent_2 || 0),
        discountNominal: Number(row.discount_nominal || 0),
        notes: row.notes || '',
        createdAt: row.created_at || new Date().toISOString(),
      }));
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(mappedItems));
      itemsCount = mappedItems.length;
    }

    // 2. Tarik history
    const { data: historyData } = await client
      .from('shopping_trips')
      .select('*')
      .order('trip_date', { ascending: false });

    if (historyData && historyData.length > 0) {
      const mappedHistory: ShoppingTrip[] = historyData.map((row: any) => ({
        id: row.id,
        date: row.trip_date,
        storeName: row.store_name,
        totalSpent: Number(row.total_spent),
        totalSavings: Number(row.total_savings),
        totalItemsCount: Number(row.total_items_count),
        budgetLimit: Number(row.budget_limit),
        itemsSnapshot: row.items_snapshot || [],
        notes: row.notes || '',
      }));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(mappedHistory));
    }

    // 3. Tarik budget
    const { data: budgetData } = await client
      .from('user_budget_settings')
      .select('*')
      .eq('id', 'default_user')
      .single();

    if (budgetData) {
      const mappedBudget: BudgetSettings = {
        monthlyBudget: Number(budgetData.monthly_budget),
        warningThresholdPercent: Number(budgetData.warning_threshold_percent),
      };
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(mappedBudget));
    }

    return {
      success: true,
      message: `Sinkronisasi Supabase Berhasil! ${itemsCount} barang dimuat.`,
      itemsCount,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Gagal menarik data dari Supabase: ${errorMsg}`,
    };
  }
}
