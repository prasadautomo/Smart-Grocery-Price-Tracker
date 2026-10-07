import React from 'react';
import { ShoppingCart, Cloud, HardDrive } from 'lucide-react';

interface HeaderProps {
  isSupabaseConnected: boolean;
  onOpenSupabaseModal: () => void;
  onOpenBudgetModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSupabaseConnected,
  onOpenSupabaseModal,
  onOpenBudgetModal,
}) => {
  return (
    <header className="stitch-hero-header">
      <div className="stitch-hero-top">
        <div className="stitch-user-profile">
          <div className="stitch-avatar" onClick={onOpenBudgetModal} title="Atur Anggaran">
            <ShoppingCart size={22} strokeWidth={2.4} />
          </div>
          <div className="stitch-user-info">
            <h1>
              <span>Halo, Rian</span>
              <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>(Anak Kos)</span>
            </h1>
            <p>Troli Belanja Supermarket</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* PWA Aktif Badge */}
          <div className="stitch-header-badge">
            <span className="stitch-header-badge-dot" />
            <span>PWA Aktif</span>
          </div>

          {/* Cloud Indicator */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
            }}
            title={isSupabaseConnected ? 'Tersambung ke Supabase Cloud' : 'Mode Offline (LocalStorage)'}
          >
            {isSupabaseConnected ? <Cloud size={15} /> : <HardDrive size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};
