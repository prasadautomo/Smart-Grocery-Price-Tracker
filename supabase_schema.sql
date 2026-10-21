-- =====================================================
-- SMART GROCERY & PRICE TRACKER (FULL CLOUD DATABASE SCHEMA)
-- Modul Pertemuan 12 - 14: Mobile PWA Rekayasa Perangkat Lunak
-- Semua data tersimpan di Cloud Database Supabase (Bukan Local Server)
-- =====================================================

-- 1. Tabel Profil Pengguna Cloud (Siswa Rantau / Kos)
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY DEFAULT 'user_rian',
    name TEXT NOT NULL DEFAULT 'Rian Pratama',
    role TEXT NOT NULL DEFAULT 'Siswa Rantau (Anak Kos)',
    email TEXT DEFAULT 'rian.rantau@codehub.sch.id',
    campus TEXT DEFAULT 'Kampus ICT Codehub',
    monthly_allowance NUMERIC(14, 2) NOT NULL DEFAULT 350000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Item Belanja Aktif di Cloud (Keranjang Belanja Realtime)
CREATE TABLE IF NOT EXISTS grocery_items (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'user_rian',
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
    priority TEXT DEFAULT 'essential', -- 'essential' | 'optional'
    is_checked_in_cart BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    image_url TEXT DEFAULT NULL,
    source TEXT DEFAULT 'Astronauts.id'
);

-- 3. Tabel Riwayat Belanja di Cloud (Arsip Struk Kasir Digital)
CREATE TABLE IF NOT EXISTS shopping_trips (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'user_rian',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    trip_date TIMESTAMPTZ DEFAULT NOW(),
    store_name TEXT DEFAULT 'Supermarket Grosir Indo Makmur',
    total_spent NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_savings NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_items_count INTEGER NOT NULL DEFAULT 0,
    budget_limit NUMERIC(14, 2) NOT NULL DEFAULT 350000,
    grand_total NUMERIC(14, 2) DEFAULT NULL,
    items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    extra_costs JSONB DEFAULT '{}'::jsonb,
    notes TEXT DEFAULT ''
);

-- 4. Tabel Patokan Harga Historis di Cloud (Database Tren Harga)
CREATE TABLE IF NOT EXISTS price_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Bahan Pokok',
    unit TEXT NOT NULL DEFAULT 'pcs',
    last_price NUMERIC(12, 2) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Pengaturan Batas Anggaran Dompet di Cloud
CREATE TABLE IF NOT EXISTS user_budget_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    user_id TEXT DEFAULT 'user_rian',
    monthly_budget NUMERIC(14, 2) NOT NULL DEFAULT 350000,
    warning_threshold_percent NUMERIC(5, 2) NOT NULL DEFAULT 80,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Aktifkan Row Level Security (RLS) & Kebijakan Akses Publik PWA
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budget_settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses PWA Cloud (Read, Insert, Update, Delete)
DROP POLICY IF EXISTS "Public full access for user_profiles" ON user_profiles;
CREATE POLICY "Public full access for user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access for grocery_items" ON grocery_items;
CREATE POLICY "Public full access for grocery_items" ON grocery_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access for shopping_trips" ON shopping_trips;
CREATE POLICY "Public full access for shopping_trips" ON shopping_trips FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access for price_benchmarks" ON price_benchmarks;
CREATE POLICY "Public full access for price_benchmarks" ON price_benchmarks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access for user_budget_settings" ON user_budget_settings;
CREATE POLICY "Public full access for user_budget_settings" ON user_budget_settings FOR ALL USING (true) WITH CHECK (true);

-- 7. Insert Data Awal Profil & Anggaran Kasus Rian
INSERT INTO user_profiles (id, name, role, email, campus, monthly_allowance)
VALUES ('user_rian', 'Rian Pratama', 'Siswa Rantau (Anak Kos)', 'rian.rantau@codehub.sch.id', 'Kampus ICT Codehub', 350000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_budget_settings (id, user_id, monthly_budget, warning_threshold_percent)
VALUES ('default_user', 'user_rian', 350000, 80)
ON CONFLICT (id) DO NOTHING;
