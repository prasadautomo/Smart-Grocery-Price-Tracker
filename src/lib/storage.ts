import type {
  GroceryItem,
  ShoppingTrip,
  BudgetSettings,
  PlannerItem,
  MasterProduct,
} from '../types/grocery';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  ITEMS: 'smart_grocery_items_v1',
  HISTORY: 'smart_grocery_history_v1',
  BUDGET: 'smart_grocery_budget_v1',
  BENCHMARKS: 'smart_grocery_benchmarks_v1',
  PLANNER: 'smart_grocery_planner_v1',
  MASTER: 'smart_grocery_master_v1',
};

function getCurrentUserId(): string {
  try {
    const raw = localStorage.getItem('smart_grocery_auth_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return u.id;
    }
  } catch {
    // fallback
  }
  return 'user_rian';
}

function getCurrentUserInfo(): { id: string; name: string; email: string; role: string } {
  try {
    const raw = localStorage.getItem('smart_grocery_auth_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) {
        return {
          id: u.id,
          name: u.name || 'Gavin Utomo',
          email: u.email || 'gavinutomo4@gmail.com',
          role: u.email?.includes('gavin') ? 'Akun Utama (Pemilik)' : 'Siswa Rantau (Anak Kos)',
        };
      }
    }
  } catch {
    // fallback
  }
  return {
    id: 'user_rian',
    name: 'Rian Pratama',
    email: 'rian.rantau@codehub.sch.id',
    role: 'Siswa Rantau (Anak Kos)',
  };
}

// Data Awal Realistis Sesuai Kasus Rian & Katalog Astro (astronauts.id)
export const INITIAL_ITEMS: GroceryItem[] = [
  {
    id: 'item-1',
    name: 'Beras Ramos Super (5 kg)',
    category: 'Bahan Pokok',
    unit: 'kg',
    quantity: 1,
    unitPrice: 88799,
    lastMonthPrice: 91300, // Turun hemat Rp 2.501
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
    name: 'Minyak Goreng Sawit (1 Liter)',
    category: 'Bahan Pokok',
    unit: 'liter',
    quantity: 1,
    unitPrice: 18000,
    lastMonthPrice: 20000, // Turun Rp 2.000 (indikator hijau hemat!)
    discountType: 'none',
    priority: 'essential',
    isCheckedInCart: true,
    notes: 'Untuk masak lauk kos hemat',
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/RestockBahanWajibdiDapur_04b8c552-e833-4f30-b13c-e09a7d5ea68e_400x400.jpg',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    name: 'Telur Ayam Negeri (1 kg)',
    category: 'Bahan Pokok',
    unit: 'kg',
    quantity: 1,
    unitPrice: 28500,
    lastMonthPrice: 28500, // Stabil sama (indikator abu-abu =)
    discountType: 'none',
    priority: 'essential',
    isCheckedInCart: false,
    notes: 'Lauk protein harian kos',
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/TelurAyamNegeriAstroFarm1_55ce9dfb-31de-4afb-b36d-1ea35f75105c_400x400.jpg',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    name: 'Sabun Pembersih Lantai (800 ml)',
    category: 'Mandi & Cuci',
    unit: 'botol',
    quantity: 1,
    unitPrice: 24000,
    lastMonthPrice: 22000, // Naik vs bulan lalu
    discountType: 'stacked',
    discountPercent1: 50,
    discountPercent2: 20, // Kasus studi F-03: Diskon 50% + 20%
    priority: 'optional',
    isCheckedInCart: false,
    notes: 'Promo cuci gudang bertingkat (50% + 20%)',
    imageUrl: 'https://image.astronauts.cloud/homepage-category/2026/10/cattiles02_85172688-a7e5-413d-84bd-f2d96f715791_239x306.png',
    source: 'Astronauts.id',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-5',
    name: 'Pasta Gigi Fresh & Protect (160g)',
    category: 'Mandi & Cuci',
    unit: 'pcs',
    quantity: 1,
    unitPrice: 14500,
    lastMonthPrice: 16000, // Turun Rp 1.500
    discountType: 'single',
    discountPercent1: 10,
    priority: 'essential',
    isCheckedInCart: false,
    notes: 'Perlengkapan mandi bulanan kos',
    imageUrl: 'https://images.openbeautyfacts.org/images/products/893/483/912/8302/front_en.3.400.jpg',
    source: 'Open Beauty Facts',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-6',
    name: 'Mie Instan Goreng Spesial (5 Bungkus)',
    category: 'Makanan Instan',
    unit: 'pack',
    quantity: 1,
    unitPrice: 15500,
    lastMonthPrice: 15500, // Stabil
    discountType: 'none',
    priority: 'essential',
    isCheckedInCart: false,
    notes: 'Penyelamat akhir bulan',
    imageUrl: 'https://images.openfoodfacts.org/images/products/008/968/618/0626/front_en.3.400.jpg',
    source: 'Open Food Facts',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-7',
    name: 'Keripik Kentang Balado (68g)',
    category: 'Makanan & Camilan',
    unit: 'bungkus',
    quantity: 2,
    unitPrice: 13500,
    lastMonthPrice: 13000, // Naik Rp 500
    discountType: 'none',
    priority: 'optional',
    isCheckedInCart: false,
    notes: 'Camilan jajan nonton film (Opsional / Siap di-trim)',
    imageUrl: 'https://images.openfoodfacts.org/images/products/008/968/659/9077/front_en.43.400.jpg',
    source: 'Open Food Facts',
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
    storeName: 'Lotte Mart Grocery - Puri Indah',
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
        name: 'Minyak Goreng Sawit (1 Liter)',
        category: 'Bahan Pokok',
        unit: 'liter',
        quantity: 1,
        unitPrice: 20000,
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
        category: 'Mandi & Cuci',
        unit: 'botol',
        quantity: 1,
        unitPrice: 22000,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'old-5',
        name: 'Pasta Gigi Fresh & Protect (160g)',
        category: 'Mandi & Cuci',
        unit: 'pcs',
        quantity: 1,
        unitPrice: 16000,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'old-6',
        name: 'Mie Instan Goreng Spesial (5 Bungkus)',
        category: 'Makanan Instan',
        unit: 'pack',
        quantity: 1,
        unitPrice: 15500,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'old-7',
        name: 'Deterjen Bubuk Konsentrat (1 kg)',
        category: 'Mandi & Cuci',
        unit: 'pack',
        quantity: 1,
        unitPrice: 24500,
        discountType: 'none',
        createdAt: new Date().toISOString(),
      },
    ],
    notes: 'Struk Belanja Bulan Lalu (Data Resmi Pembanding Kasus Rian)',
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
 * Menyimpan item belanja aktif ke LocalStorage & OTOMATIS Realtime Unggah ke Supabase Cloud
 */
export async function saveGroceryItems(items: GroceryItem[]): Promise<void> {
  // 1. Simpan ke local cache untuk performa responsif
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items to localStorage:', e);
  }

  // 2. OTOMATIS REALTIME SYNC KE CLOUD SUPABASE (Tanpa Tekan Tombol Manual)
  const client = getSupabaseClient();
  if (client) {
    try {
      const activeUserId = getCurrentUserId();
      // Hapus item keranjang user saat ini
      await client.from('grocery_items').delete().eq('user_id', activeUserId);

      if (items.length > 0) {
        const records = items.map((i) => ({
          id: i.id,
          user_id: activeUserId,
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
          priority: i.priority || 'essential',
          is_checked_in_cart: i.isCheckedInCart || false,
          notes: i.notes || '',
          image_url: i.imageUrl || null,
          source: i.source || 'Astronauts.id',
        }));
        await client.from('grocery_items').insert(records);
      }
      console.log('[Realtime Cloud] Perubahan keranjang belanja otomatis tersimpan di Cloud Supabase!');
    } catch (err) {
      console.warn('[Realtime Cloud] Gagal otomatis sinkron keranjang ke Supabase:', err);
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
 * Menyimpan Riwayat Belanja ke LocalStorage & OTOMATIS Realtime Unggah ke Supabase Cloud
 */
export async function saveShoppingHistory(trips: ShoppingTrip[]): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trips));
  } catch (e) {
    console.error('Error saving history to localStorage:', e);
  }

  // OTOMATIS REALTIME SYNC KE CLOUD SUPABASE
  const client = getSupabaseClient();
  if (client) {
    try {
      const activeUserId = getCurrentUserId();
      for (const trip of trips) {
        await client.from('shopping_trips').upsert({
          id: trip.id,
          user_id: activeUserId,
          store_name: trip.storeName,
          trip_date: trip.date,
          total_spent: trip.totalSpent,
          total_savings: trip.totalSavings,
          total_items_count: trip.totalItemsCount,
          budget_limit: trip.budgetLimit,
          grand_total: trip.grandTotal || trip.totalSpent,
          items_snapshot: trip.itemsSnapshot,
          extra_costs: trip.extraCosts || {},
          notes: trip.notes || '',
        });
      }
      console.log('[Realtime Cloud] Struk belanja otomatis tersimpan di Cloud Supabase!');
    } catch (err) {
      console.warn('[Realtime Cloud] Gagal otomatis sinkron riwayat ke Supabase:', err);
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
 * Menyimpan Pengaturan Anggaran ke LocalStorage & OTOMATIS Realtime Unggah ke Supabase Cloud
 */
export async function saveBudgetSettings(settings: BudgetSettings): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving budget settings:', e);
  }

  // OTOMATIS REALTIME SYNC KE CLOUD SUPABASE
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('user_budget_settings').upsert({
        id: 'default_user',
        user_id: 'user_rian',
        monthly_budget: settings.monthlyBudget,
        warning_threshold_percent: settings.warningThresholdPercent,
        updated_at: new Date().toISOString(),
      });
      console.log('[Realtime Cloud] Pengaturan anggaran otomatis tersimpan di Cloud Supabase!');
    } catch (err) {
      console.warn('[Realtime Cloud] Gagal otomatis sinkron budget ke Supabase:', err);
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
 * Daftar rekomendasi/auto-suggest nama barang dari riwayat belanja bulan lalu (F-01)
 */
export interface ProductSuggestion {
  name: string;
  category: string;
  unit: string;
  lastMonthPrice: number | null;
}

export function getHistoricalProductSuggestions(): ProductSuggestion[] {
  const suggestionsMap = new Map<string, ProductSuggestion>();

  // 1. Ambil dari riwayat struk belanja
  try {
    const history = loadShoppingHistory();
    history.forEach((trip) => {
      trip.itemsSnapshot.forEach((item) => {
        const key = item.name.trim().toLowerCase();
        if (!suggestionsMap.has(key)) {
          suggestionsMap.set(key, {
            name: item.name,
            category: item.category,
            unit: item.unit,
            lastMonthPrice: item.unitPrice,
          });
        }
      });
    });
  } catch (e) {
    console.error('Error getting history suggestions:', e);
  }

  // 2. Ambil dari seed items contoh kasus Rian
  INITIAL_ITEMS.forEach((item) => {
    const key = item.name.trim().toLowerCase();
    if (!suggestionsMap.has(key)) {
      suggestionsMap.set(key, {
        name: item.name,
        category: item.category,
        unit: item.unit,
        lastMonthPrice: item.lastMonthPrice ?? item.unitPrice,
      });
    }
  });

  return Array.from(suggestionsMap.values());
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
        priority: row.priority || 'essential',
        isCheckedInCart: row.is_checked_in_cart ?? false,
        imageUrl: row.image_url || null,
        source: row.source || 'Astronauts.id',
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
        grandTotal: Number(row.grand_total || row.total_spent),
        extraCosts: row.extra_costs || {},
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

/**
 * Unggah seluruh data belanja (Profil, Keranjang, Struk, Anggaran) ke Cloud Supabase
 */
export async function pushAllDataToCloud(): Promise<{
  success: boolean;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase client belum terhubung! Masukkan URL & Anon Key terlebih dahulu.',
    };
  }

  try {
    const activeUser = getCurrentUserInfo();

    // 1. Simpan Profil Pengguna ke Cloud
    await client.from('user_profiles').upsert({
      id: activeUser.id,
      name: activeUser.name,
      role: activeUser.role,
      email: activeUser.email,
      campus: 'Kampus ICT Codehub',
      monthly_allowance: 350000,
      updated_at: new Date().toISOString(),
    });

    // 2. Simpan Pengaturan Anggaran ke Cloud
    const budget = loadBudgetSettings();
    await client.from('user_budget_settings').upsert({
      id: 'default_user',
      user_id: activeUser.id,
      monthly_budget: budget.monthlyBudget,
      warning_threshold_percent: budget.warningThresholdPercent,
      updated_at: new Date().toISOString(),
    });

    // 3. Simpan Keranjang Belanja Aktif ke Cloud
    const items = loadGroceryItems();
    if (items.length > 0) {
      await client.from('grocery_items').delete().neq('id', 'placeholder_id');
      const records = items.map((i) => ({
        id: i.id,
        user_id: activeUser.id,
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
        priority: i.priority || 'essential',
        is_checked_in_cart: i.isCheckedInCart || false,
        notes: i.notes || '',
        image_url: i.imageUrl || null,
        source: i.source || 'Astronauts.id',
      }));
      await client.from('grocery_items').insert(records);
    }

    // 4. Simpan Riwayat Struk Belanja ke Cloud
    const history = loadShoppingHistory();
    for (const trip of history) {
      await client.from('shopping_trips').upsert({
        id: trip.id,
        user_id: activeUser.id,
        store_name: trip.storeName,
        trip_date: trip.date,
        total_spent: trip.totalSpent,
        total_savings: trip.totalSavings,
        total_items_count: trip.totalItemsCount,
        budget_limit: trip.budgetLimit,
        grand_total: trip.grandTotal || trip.totalSpent,
        items_snapshot: trip.itemsSnapshot,
        extra_costs: trip.extraCosts || {},
        notes: trip.notes || '',
      });
    }

    return {
      success: true,
      message: 'Seluruh data pengguna berhasil disimpan ke Cloud Database Supabase!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Could not find the table') || errorMsg.includes('relation') || errorMsg.includes('does not exist')) {
      return {
        success: false,
        message: 'Tabel database belum dibuat di Supabase Cloud. Silakan buka SQL Editor di Supabase Dashboard, copy isi file supabase_schema.sql, dan klik Run.',
      };
    }
    return {
      success: false,
      message: `Gagal menyimpan ke Cloud: ${errorMsg}`,
    };
  }
}

// ============================================================
// SHOPPING PLANNER (RENCANA KEBUTUHAN DARI KOS/RUMAH)
// ============================================================

export const INITIAL_PLANNER_ITEMS: PlannerItem[] = [
  {
    id: 'plan-1',
    name: 'Beras Ramos Super (5 kg)',
    category: 'Bahan Pokok',
    unit: 'pack',
    quantity: 1,
    estimatedPrice: 72000,
    notes: 'Kebutuhan makan pokok 1 bulan',
    isPurchased: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    name: 'Minyak Goreng Sawit (1 Liter)',
    category: 'Bahan Pokok',
    unit: 'liter',
    quantity: 1,
    estimatedPrice: 20000,
    notes: 'Untuk masak lauk kos',
    isPurchased: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-3',
    name: 'Telur Ayam Negeri (1 kg)',
    category: 'Bahan Pokok',
    unit: 'kg',
    quantity: 1,
    estimatedPrice: 28500,
    notes: 'Sumber protein utama hemat',
    isPurchased: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-4',
    name: 'Sabun Cuci Deterjen (800g)',
    category: 'Mandi & Kebersihan',
    unit: 'pack',
    quantity: 1,
    estimatedPrice: 19500,
    notes: 'Cuci pakaian mingguan',
    isPurchased: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-5',
    name: 'Pasta Gigi Fresh (160g)',
    category: 'Mandi & Kebersihan',
    unit: 'pcs',
    quantity: 1,
    estimatedPrice: 16000,
    notes: 'Kebersihan diri kos',
    isPurchased: false,
    createdAt: new Date().toISOString(),
  },
];

export function loadPlannerItems(): PlannerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANNER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading planner items:', e);
  }
  savePlannerItems(INITIAL_PLANNER_ITEMS);
  return INITIAL_PLANNER_ITEMS;
}

export function savePlannerItems(items: PlannerItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving planner items:', e);
  }
}

// ============================================================
// DAFTAR ACUAN HARGA BULAN LALU (MASTER BENCHMARK DATABASE)
// ============================================================

export const INITIAL_MASTER_PRODUCTS: MasterProduct[] = [
  {
    id: 'master-1',
    name: 'Beras Ramos Super (5 kg)',
    category: 'Bahan Pokok',
    unit: 'pack',
    lastMonthPrice: 73000,
    storeName: 'Lotte Mart Grocery - Puri Indah',
    barcode: '8992753311201',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'master-2',
    name: 'Minyak Goreng Sawit (1 Liter)',
    category: 'Bahan Pokok',
    unit: 'liter',
    lastMonthPrice: 20000,
    storeName: 'Lotte Mart Grocery - Puri Indah',
    barcode: '8991002105432',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'master-3',
    name: 'Telur Ayam Negeri (1 kg)',
    category: 'Bahan Pokok',
    unit: 'kg',
    lastMonthPrice: 28500,
    storeName: 'Lotte Mart Grocery - Puri Indah',
    barcode: '8998866200192',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'master-4',
    name: 'Sabun Pembersih Lantai (800 ml)',
    category: 'Mandi & Kebersihan',
    unit: 'botol',
    lastMonthPrice: 14000,
    storeName: 'Lotte Mart Grocery - Puri Indah',
    barcode: '8993189201018',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'master-5',
    name: 'Pasta Gigi Fresh & Protect (160g)',
    category: 'Mandi & Kebersihan',
    unit: 'pcs',
    lastMonthPrice: 16000,
    storeName: 'Lotte Mart Grocery - Puri Indah',
    barcode: '8991111002345',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'master-6',
    name: 'Mie Instan Goreng Spesial (5 Bungkus)',
    category: 'Makanan & Camilan',
    unit: 'pack',
    lastMonthPrice: 15500,
    storeName: 'Lotte Mart Grocery - Puri Indah',
    barcode: '8991001100223',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
  {
    id: 'master-7',
    name: 'Deterjen Rinso Molto Cair (750 ml)',
    category: 'Mandi & Kebersihan',
    unit: 'pouch',
    lastMonthPrice: 24500,
    storeName: 'Lotte Mart Grocery - Puri Indah',
    barcode: '8999999001234',
    updatedAt: '2026-09-28T10:00:00.000Z',
  },
];

export function loadMasterProducts(): MasterProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading master products:', e);
  }
  saveMasterProducts(INITIAL_MASTER_PRODUCTS);
  return INITIAL_MASTER_PRODUCTS;
}

export function saveMasterProducts(items: MasterProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTER, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving master products:', e);
  }
}


