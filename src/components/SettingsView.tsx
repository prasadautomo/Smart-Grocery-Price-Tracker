import React from 'react';
import {
  Wallet,
  Cloud,
  Smartphone,
  RotateCcw,
  Info,
  User,
} from 'lucide-react';
import type { BudgetSettings } from '../types/grocery';
import type { UserProfile } from '../types/auth';
import { formatRupiah } from '../lib/calculations';
import { GoogleIcon } from './GoogleIcon';

interface SettingsViewProps {
  budgetSettings: BudgetSettings;
  isSupabaseConnected: boolean;
  user: UserProfile | null;
  onOpenBudgetModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenAuthModal: () => void;
  onResetDemoData: () => void;
  onInstallPwa?: () => void;
  isInstallable: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  budgetSettings,
  isSupabaseConnected,
  user,
  onOpenBudgetModal,
  onOpenSupabaseModal,
  onOpenAuthModal,
  onResetDemoData,
  onInstallPwa,
  isInstallable,
}) => {
  return (
    <div className="settings-tab-section" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="section-header">
        <div className="section-title">
          <span>Pengaturan & Akun Cloud</span>
        </div>
      </div>

      {/* Card 0: Profil Akun Google (Google OAuth) */}
      <div
        className="card"
        style={{
          border: user ? '1.5px solid #a7f3d0' : '1px solid var(--border-subtle)',
          background: user
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 100%)'
            : undefined,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #10b981',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=10b981&color=fff`;
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    background: '#ffffff',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <GoogleIcon size={11} />
                </div>
              </div>
            ) : (
              <div
                className="header-logo-badge"
                style={{
                  width: 44,
                  height: 44,
                  background: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <GoogleIcon size={22} />
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 800 }}>
                {user ? user.name : 'Akun Google Belum Masuk'}
              </h4>
              <p style={{ fontSize: '11.5px', color: user ? '#34d399' : '#94a3b8' }}>
                {user ? user.email : 'Sinkronkan data belanja via Google OAuth'}
              </p>
            </div>
          </div>

          <span className={`cloud-status-pill ${user ? 'connected' : 'offline'}`}>
            <span className={`cloud-dot ${user ? 'pulse' : ''}`} />
            {user ? 'Google Aktif' : 'Tamu'}
          </span>
        </div>

        <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45, marginBottom: 12 }}>
          {user
            ? 'Akun kamu terhubung dan otomatis menyinkronkan keranjang troli, riwayat struk kasir, dan anggaran belanja ke cloud database.'
            : 'Masuk dengan Akun Google untuk menyimpan daftar belanja dan riwayat struk digital secara permanen lintas gadget.'}
        </p>

        {user ? (
          <button
            className="btn-secondary"
            style={{ width: '100%', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={onOpenAuthModal}
          >
            <User size={15} />
            <span>Kelola Profil & Ganti Akun</span>
          </button>
        ) : (
          <button
            className="btn-primary"
            style={{
              width: '100%',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
            }}
            onClick={onOpenAuthModal}
          >
            <GoogleIcon size={16} />
            <span>Masuk dengan Google (1-Klik)</span>
          </button>
        )}
      </div>

      {/* Card 1: Batas Anggaran Dompet */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="header-logo-badge" style={{ width: 36, height: 36 }}>
              <Wallet size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', color: '#fff' }}>Batas Anggaran Bulanan</h4>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Pengendali jatah uang saku kos</p>
            </div>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#34d399' }}>
            {formatRupiah(budgetSettings.monthlyBudget)}
          </span>
        </div>

        <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4, marginBottom: 12 }}>
          Peringatan waspada akan menyala jika total belanjaan troli mencapai {budgetSettings.warningThresholdPercent}% dari limit.
        </p>

        <button className="btn-secondary" style={{ width: '100%', fontSize: '13px' }} onClick={onOpenBudgetModal}>
          Ubah Batas Anggaran & Limit
        </button>
      </div>

      {/* Card 2: Supabase Cloud Database */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              className="header-logo-badge"
              style={{
                width: 36,
                height: 36,
                background: isSupabaseConnected
                  ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
              }}
            >
              <Cloud size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', color: '#fff' }}>Database Supabase</h4>
              <p style={{ fontSize: '11px', color: isSupabaseConnected ? '#34d399' : '#94a3b8' }}>
                {isSupabaseConnected ? 'Tersambung ke Cloud' : 'Mode Offline (LocalStorage)'}
              </p>
            </div>
          </div>
          <span className={`cloud-status-pill ${isSupabaseConnected ? 'connected' : 'offline'}`}>
            <span className={`cloud-dot ${isSupabaseConnected ? 'pulse' : ''}`} />
            {isSupabaseConnected ? 'Aktif' : 'Lokal'}
          </span>
        </div>

        <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4, marginBottom: 12 }}>
          Hubungkan project Supabase agar data belanja tersimpan di cloud database secara realtime dan dapat diakses dari perangkat mana pun.
        </p>

        <button className="btn-primary" style={{ width: '100%', fontSize: '13px' }} onClick={onOpenSupabaseModal}>
          Kelola Koneksi & Sinkronkan
        </button>
      </div>

      {/* Card 3: PWA & Install ke Layar Utama */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            className="header-logo-badge"
            style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            <Smartphone size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '14.5px', color: '#fff' }}>Aplikasi PWA (Mobile Native)</h4>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Dapat dipasang di Homescreen HP</p>
          </div>
        </div>

        <p style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.4, marginBottom: 12 }}>
          Aplikasi ini mendukung Progressive Web App (PWA) tanpa download dari Play Store. Buka menu browser lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
        </p>

        {isInstallable && onInstallPwa && (
          <button className="btn-primary" style={{ width: '100%', fontSize: '13px' }} onClick={onInstallPwa}>
            Pasang Aplikasi ke Ponsel Sekarang
          </button>
        )}
      </div>

      {/* Card 4: Reset Demo Data */}
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            className="header-logo-badge"
            style={{ width: 36, height: 36, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
          >
            <RotateCcw size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '14.5px', color: '#fff' }}>Reset Kasus Rian</h4>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Kembalikan data contoh Pertemuan 12 - 14</p>
          </div>
        </div>

        <button
          className="btn-secondary"
          style={{ width: '100%', fontSize: '13px', color: '#f87171' }}
          onClick={() => {
            if (confirm('Kembalikan data troli & riwayat belanja ke contoh awal kasus Rian?')) {
              onResetDemoData();
              alert('Data berhasil dipulihkan!');
            }
          }}
        >
          Reset ke Data Awal
        </button>
      </div>

      {/* App Info Footer */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)', alignItems: 'center' }}>
        <Info size={14} color="#64748b" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
          SafeGrocer Mobile • Smart Grocery & Budget Safety Tracker.
        </p>
      </div>
    </div>
  );
};
