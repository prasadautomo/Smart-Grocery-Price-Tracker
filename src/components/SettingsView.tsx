import React from 'react';
import {
  Wallet,
  Cloud,
  Smartphone,
  RotateCcw,
  Info,
} from 'lucide-react';
import type { BudgetSettings } from '../types/grocery';
import { formatRupiah } from '../lib/calculations';

interface SettingsViewProps {
  budgetSettings: BudgetSettings;
  isSupabaseConnected: boolean;
  onOpenBudgetModal: () => void;
  onOpenSupabaseModal: () => void;
  onResetDemoData: () => void;
  onInstallPwa?: () => void;
  isInstallable: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  budgetSettings,
  isSupabaseConnected,
  onOpenBudgetModal,
  onOpenSupabaseModal,
  onResetDemoData,
  onInstallPwa,
  isInstallable,
}) => {
  return (
    <div className="settings-tab-section" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="section-header">
        <div className="section-title">
          <span>Pengaturan & Integrasi Cloud</span>
        </div>
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

      {/* Info Kurikulum */}
      <div style={{ display: 'flex', gap: 8, padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
        <Info size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
          ICT Codehub Kelas 12 • Pertemuan 12 - 14: Rekayasa Perangkat Lunak Mobile PWA, Formula Perhitungan Cerdas, dan Integrasi Database Cloud Supabase + Deployment Vercel.
        </p>
      </div>
    </div>
  );
};
