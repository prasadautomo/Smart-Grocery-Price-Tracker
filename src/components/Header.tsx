import React from 'react';
import { ShoppingCart, Cloud, SlidersHorizontal } from 'lucide-react';
import type { UserProfile } from '../types/auth';
import { GoogleIcon } from './GoogleIcon';

interface HeaderProps {
  isSupabaseConnected: boolean;
  user?: UserProfile | null;
  onOpenSupabaseModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenAuthModal?: () => void;
  activeTab?: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  isSupabaseConnected,
  user,
  onOpenSupabaseModal,
  onOpenBudgetModal,
  onOpenAuthModal,
  activeTab = 'cart',
  children,
}) => {
  return (
    <header className={`stitch-hero-header ${!children ? 'compact' : ''}`}>
      <div className="stitch-hero-top">
        <div className="stitch-user-profile">
          <div
            className="stitch-avatar"
            onClick={user && onOpenAuthModal ? onOpenAuthModal : onOpenBudgetModal}
            title={user ? `Akun: ${user.name}` : 'Atur Anggaran'}
            style={
              user
                ? {
                    padding: 0,
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.7)',
                    background: '#ffffff',
                  }
                : undefined
            }
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
              <ShoppingCart size={20} strokeWidth={2.4} />
            )}
          </div>
          <div className="stitch-user-info">
            <h1>{user ? `Halo, ${user.name.split(' ')[0]}!` : 'SafeGrocer'}</h1>
            <p>
              {activeTab === 'cart' && 'Troli Belanja Supermarket'}
              {activeTab === 'history' && 'Riwayat & Struk Belanja'}
              {activeTab === 'calculator' && 'Pengendali Anggaran & Promo'}
              {activeTab === 'settings' && 'Pengaturan & Cloud Sync'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Tombol Login Google / Akun Profil */}
          {user ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '20px',
                padding: '4px 8px 4px 5px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
              title={`Akun Google: ${user.name} (${user.email})`}
            >
              <GoogleIcon size={13} />
              <span
                style={{
                  maxWidth: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '20px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
              title="Masuk dengan Google"
            >
              <GoogleIcon size={14} />
              <span>Masuk</span>
            </button>
          )}

          {/* Cloud Database Status */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              padding: '5px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            title={isSupabaseConnected ? 'Tersambung ke Supabase Cloud' : 'Klik untuk hubungkan database Cloud'}
          >
            <Cloud size={13} color={isSupabaseConnected ? '#a7f3d0' : '#ffffff'} />
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isSupabaseConnected ? '#10b981' : '#f59e0b',
                boxShadow: isSupabaseConnected ? '0 0 6px #10b981' : 'none',
              }}
            />
          </button>

          {/* Settings / Budget trigger button */}
          <button
            type="button"
            onClick={onOpenBudgetModal}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            title="Pengaturan Anggaran"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Hero Child (Budget Safety Banner on Cart tab) */}
      {children}
    </header>
  );
};
