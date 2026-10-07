import React from 'react';
import { ShoppingBag, Cloud, HardDrive, Settings } from 'lucide-react';

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
    <header className="mobile-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo-badge">
            <ShoppingBag size={20} strokeWidth={2.5} />
          </div>
          <div className="header-title-group">
            <h1>Smart Grocery</h1>
            <p>Anak Kos Price & Budget Tracker</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Status Sinkronisasi Cloud Supabase */}
          <button
            className={`cloud-status-pill ${isSupabaseConnected ? 'connected' : 'offline'}`}
            onClick={onOpenSupabaseModal}
            title={
              isSupabaseConnected
                ? 'Terhubung ke Supabase Cloud (Klik untuk info)'
                : 'Penyimpanan Lokal Aktif (Klik untuk hubungkan Supabase)'
            }
          >
            <span className={`cloud-dot ${isSupabaseConnected ? 'pulse' : ''}`} />
            {isSupabaseConnected ? (
              <>
                <Cloud size={13} />
                <span>Cloud</span>
              </>
            ) : (
              <>
                <HardDrive size={13} />
                <span>Offline</span>
              </>
            )}
          </button>

          {/* Quick Settings Icon */}
          <button
            className="icon-action-btn"
            onClick={onOpenBudgetModal}
            title="Pengaturan Anggaran"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
