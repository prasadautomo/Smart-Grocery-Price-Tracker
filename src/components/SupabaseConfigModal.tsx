import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  RefreshCw,
  Database,
  ShieldCheck,
} from 'lucide-react';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import { pullDataFromSupabase } from '../lib/storage';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (connected: boolean) => void;
  onRefreshData: () => void;
  onResetDemoData: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
  onRefreshData,
  onResetDemoData,
}) => {
  const currentConfig = getSavedSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(res);
      if (res.success) {
        saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
        onConnectionChange(true);
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setTestResult({ success: false, message: errorMsg });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndSync = async () => {
    saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    setIsTesting(true);
    try {
      const pullRes = await pullDataFromSupabase();
      if (pullRes.success) {
        onConnectionChange(true);
        onRefreshData();
        alert('Pengaturan Supabase disimpan & data berhasil disinkronkan!');
        onClose();
      } else {
        alert(pullRes.message);
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySqlSchema = () => {
    const sqlSchema = `-- SMART GROCERY SUPABASE SCHEMA
CREATE TABLE IF NOT EXISTS grocery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Bahan Pokok',
    unit TEXT NOT NULL DEFAULT 'pcs',
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_month_price NUMERIC(12, 2) DEFAULT NULL,
    discount_type TEXT NOT NULL DEFAULT 'none',
    discount_percent_1 NUMERIC(5, 2) DEFAULT 0,
    discount_percent_2 NUMERIC(5, 2) DEFAULT 0,
    discount_nominal NUMERIC(12, 2) DEFAULT 0,
    notes TEXT DEFAULT ''
);

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

CREATE TABLE IF NOT EXISTS user_budget_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    monthly_budget NUMERIC(14, 2) NOT NULL DEFAULT 350000,
    warning_threshold_percent NUMERIC(5, 2) NOT NULL DEFAULT 80,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_budget_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public grocery_items" ON grocery_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public shopping_trips" ON shopping_trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public budget" ON user_budget_settings FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle-bar" />
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cloud size={20} color="#38bdf8" />
            <h2>Koneksi Supabase Cloud</h2>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body">
          <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.5 }}>
            Hubungkan aplikasi ke database Supabase milikmu agar data troli belanja, struk digital, dan patokan harga tersimpan aman di cloud.
          </p>

          {/* Form Credentials */}
          <div className="form-group">
            <label className="form-label">Supabase Project URL *</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://xyzprojectid.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supabase Anon Public API Key *</label>
            <input
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
            />
          </div>

          {/* Tombol Uji Koneksi */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, fontSize: '13px', padding: '10px' }}
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              <ShieldCheck size={16} />
              <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, fontSize: '13px', padding: '10px' }}
              onClick={handleCopySqlSchema}
              title="Salin skema SQL untuk dipaste ke SQL Editor Supabase"
            >
              <Copy size={16} />
              <span>{copiedSql ? 'Tersalin! ✅' : 'Salin SQL Schema'}</span>
            </button>
          </div>

          {/* Hasil Uji Koneksi */}
          {testResult && (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: testResult.success
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
              ) : (
                <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
              )}
              <span
                style={{
                  fontSize: '12px',
                  color: testResult.success ? '#34d399' : '#fca5a5',
                  lineHeight: 1.4,
                }}
              >
                {testResult.message}
              </span>
            </div>
          )}

          {/* Tombol Simpan & Sinkronisasi */}
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', marginTop: 4 }}
            onClick={handleSaveAndSync}
            disabled={isTesting}
          >
            <RefreshCw size={16} />
            <span>Simpan & Sinkronkan Data Cloud</span>
          </button>

          {/* Reset Demo Data & LocalStorage Backup */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>
              Mode Demo & Data Lokal (LocalStorage)
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: 10 }}>
              Jika belum memiliki akun Supabase, aplikasi tetap bekerja 100% menggunakan LocalStorage browser secara otomatis tanpa error.
            </p>
            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', fontSize: '12px' }}
              onClick={() => {
                if (confirm('Kembalikan data ke contoh kasus Rian (Pertemuan 12 - 14)?')) {
                  onResetDemoData();
                  alert('Data demo Rian berhasil dipulihkan!');
                  onClose();
                }
              }}
            >
              <Database size={14} />
              <span>Reset ke Data Studi Kasus Rian</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
