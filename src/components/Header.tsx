import React from 'react';
import { ShoppingBag, MapPin, Calendar, Cloud, Wallet, ChevronDown } from 'lucide-react';
import type { UserProfile } from '../types/auth';
import { GoogleIcon } from './GoogleIcon';
import { formatRupiah } from '../lib/calculations';

export const STORE_OPTIONS = [
  'Lotte Mart Grocery - Puri Indah',
  'Super Indo - Puri Pesanggrahan',
  'GrandLucky SCBD',
  'Hypermart - Puri Indah Mall',
  'Indomaret Fresh - Kos Rian',
  'Pasar Tradisional Puri',
];

interface HeaderProps {
  isSupabaseConnected: boolean;
  user?: UserProfile | null;
  budgetLimit?: number;
  selectedStore?: string;
  sessionDate?: string;
  onStoreChange?: (store: string) => void;
  onDateChange?: (date: string) => void;
  onOpenSupabaseModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenAuthModal?: () => void;
  activeTab?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  isSupabaseConnected,
  user,
  budgetLimit = 350000,
  selectedStore = 'Lotte Mart Grocery - Puri Indah',
  sessionDate = new Date().toISOString().slice(0, 10),
  onStoreChange,
  onDateChange,
  onOpenSupabaseModal,
  onOpenBudgetModal,
  onOpenAuthModal,
  activeTab = 'cart',
  children,
}) => {
  return (
    <header
      style={{
        background: '#FAF8F5',
        borderBottom: '1px solid #e8dfd5',
        padding: '12px 14px 10px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Left: Squircle Bag Icon & Stacked 3-Line Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, flex: 1 }}>
          {/* Squircle Bag Icon */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: '#181512',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '2px solid #292524',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <ShoppingBag size={22} color="#f59e0b" />
          </div>

          {/* 3 Lines Stacked Info */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Line 1: Title & PRO Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#181512',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                KeranjangPintar
              </span>
              <span
                style={{
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#b45309',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  fontWeight: 900,
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                }}
              >
                PRO
              </span>
            </div>

            {/* Line 2: Store Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <MapPin size={11} color="#d97706" style={{ flexShrink: 0 }} />
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <select
                  value={selectedStore}
                  onChange={(e) => onStoreChange && onStoreChange(e.target.value)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    background: 'transparent',
                    border: 'none',
                    padding: '0 14px 0 0',
                    fontSize: '11px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    color: '#181512',
                    cursor: 'pointer',
                    outline: 'none',
                    maxWidth: '160px',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  title="Pilih Toko Belanja"
                >
                  {STORE_OPTIONS.map((store) => (
                    <option key={store} value={store}>
                      {store}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  color="#78716c"
                  style={{ position: 'absolute', right: 0, pointerEvents: 'none' }}
                />
              </div>
            </div>

            {/* Line 3: Compact Date Picker & Online Cloud Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  background: '#ffffff',
                  border: '1px solid #dcd2c6',
                  borderRadius: 5,
                  padding: '1px 5px',
                }}
                title="Tanggal Sesi Belanja"
              >
                <Calendar size={10} color="#78716c" />
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => onDateChange && onDateChange(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontSize: '9.5px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: '#181512',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              </div>

              <div
                onClick={onOpenSupabaseModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '1px 5px',
                  borderRadius: 5,
                  background: isSupabaseConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
                  color: isSupabaseConnected ? '#047857' : '#b45309',
                  border: `1px solid ${isSupabaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  fontSize: '9px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
                title={isSupabaseConnected ? 'Supabase Realtime Cloud Aktif' : 'Klik untuk hubungkan database Supabase'}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: isSupabaseConnected ? '#10b981' : '#f59e0b',
                    boxShadow: isSupabaseConnected ? '0 0 5px #10b981' : 'none',
                  }}
                />
                <span>{isSupabaseConnected ? 'CLOUD' : 'OFFLINE'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Budget Trigger & User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Quick Budget Trigger */}
          <button
            type="button"
            onClick={onOpenBudgetModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 20,
              background: '#ffffff',
              border: '1.5px solid #dcd2c6',
              boxShadow: '0 2px 0 #dcd2c6',
              color: '#181512',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: 800,
            }}
            title="Ubah Batas Dompet"
          >
            <Wallet size={13} color="#d97706" />
            <span>{formatRupiah(budgetLimit).replace('Rp ', 'Rp ')}</span>
          </button>

          {/* User Profile Avatar / Trigger */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#181512',
              border: '2px solid #292524',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            title={user ? `Akun Google: ${user.name}` : 'Masuk dengan Akun Google'}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=10b981&color=fff`;
                }}
              />
            ) : (
              <GoogleIcon size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Child element (e.g. Tactile Segmented Radar Display on Cart tab) */}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </header>
  );
};
