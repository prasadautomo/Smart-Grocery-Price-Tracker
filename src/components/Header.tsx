import React from 'react';
import { ShoppingCart, Cloud, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
  onOpenBudgetModal: () => void;
  activeTab?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  isSupabaseConnected,
  onOpenSupabaseModal,
  onOpenBudgetModal,
  activeTab = 'cart',
  children,
}) => {
  return (
    <header className={`stitch-hero-header ${!children ? 'compact' : ''}`}>
      <div className="stitch-hero-top">
        <div className="stitch-user-profile">
          <div className="stitch-avatar" onClick={onOpenBudgetModal} title="Atur Anggaran">
            <ShoppingCart size={20} strokeWidth={2.4} />
          </div>
          <div className="stitch-user-info">
            <h1>SafeGrocer</h1>
            <p>
              {activeTab === 'cart' && 'Troli Belanja Supermarket'}
              {activeTab === 'history' && 'Riwayat & Struk Belanja'}
              {activeTab === 'calculator' && 'Pengendali Anggaran & Promo'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Cloud Database Status */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              padding: '5px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            title={isSupabaseConnected ? 'Tersambung ke Supabase Cloud' : 'Klik untuk hubungkan database Cloud'}
          >
            <Cloud size={14} color={isSupabaseConnected ? '#a7f3d0' : '#ffffff'} />
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isSupabaseConnected ? '#10b981' : '#f59e0b',
                boxShadow: isSupabaseConnected ? '0 0 6px #10b981' : 'none',
              }}
            />
            <span>{isSupabaseConnected ? 'Cloud' : 'Offline'}</span>
          </button>

          {/* Settings / Budget trigger button */}
          <button
            type="button"
            onClick={onOpenBudgetModal}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            title="Pengaturan Anggaran"
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Hero Child (Budget Safety Banner on Cart tab) */}
      {children}
    </header>
  );
};

