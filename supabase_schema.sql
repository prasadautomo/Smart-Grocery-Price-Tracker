-- =====================================================
-- SMART GROCERY & PRICE TRACKER (SUPABASE DATABASE SCHEMA)
-- Modul Pertemuan 12 - 14: Mobile PWA Rekayasa Perangkat Lunak
-- =====================================================

-- 1. Tabel Item Belanja Aktif (Keranjang Belanja)
CREATE TABLE IF NOT EXISTS grocery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Bahan Pokok',
    unit TEXT NOT NULL DEFAULT 'pcs',
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_price NUMERIC(12, 2) DEFAULT NULL,
    discount_type TEXT NOT NULL DEFAULT 'none', -- 'none', 'single', 'stacked', 'nominal'
    discount_percent_1 NUMERIC(5, 2) DEFAULT 0,
    discount_percent_2 NUMERIC(5, 2) DEFAULT 0,
    discount_nominal NUMERIC(12, 2) DEFAULT 0,
    notes TEXT DEFAULT ''
);

-- 2. Tabel Riwayat Belanja (Struk Digital Bulanan)
CREATE TABLE IF NOT EXISTS shopping_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    trip_date TIMESTAMPTZ DEFAULT NOW(),
    store_name TEXT DEFAULT 'Supermarket Grosir',
    total_spent NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_savings NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_items_count INTEGER NOT NULL DEFAULT 0,
    budget_limit NUMERIC(14, 2) NOT NULL DEFAULT 0,
    items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT ''
);

-- 3. Tabel Patokan Harga Historis (Benchmark Harga per Produk)
CREATE TABLE IF NOT EXISTS price_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Bahan Pokok',
    unit TEXT NOT NULL DEFAULT 'pcs',
    last_price NUMERIC(12, 2) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Pengaturan Anggaran & Preferensi Pengguna
CREATE TABLE IF NOT EXISTS user_budget_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    monthly_budget NUMERIC(14, 2) NOT NULL DEFAULT 350000,
    warning_threshold_percent NUMERIC(5, 2) NOT NULL DEFAULT 80,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Aktifkan Row Level Security (RLS) & Kebijakan Akses Publik (Anon Key)
-- Catatan: Agar aplikasi PWA bisa langsung baca & tulis menggunakan Supabase Anon Key
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budget_settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses anonim (Read, Insert, Update, Delete)
CREATE POLICY "Public full access for grocery_items" 
    ON grocery_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access for shopping_trips" 
    ON shopping_trips FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access for price_benchmarks" 
    ON price_benchmarks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public full access for user_budget_settings" 
    ON user_budget_settings FOR ALL USING (true) WITH CHECK (true);

-- 6. Insert data awal preferensi anggaran jika belum ada
INSERT INTO user_budget_settings (id, monthly_budget, warning_threshold_percent)
VALUES ('default_user', 350000, 80)
ON CONFLICT (id) DO NOTHING;

-- Selesai! Schema siap digunakan di Supabase SQL Editor.
