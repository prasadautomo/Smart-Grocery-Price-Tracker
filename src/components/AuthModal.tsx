import React, { useState } from 'react';
import {
  X,
  LogOut,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { UserProfile } from '../types/auth';
import { GoogleIcon } from './GoogleIcon';
import {
  signInWithGoogleOAuth,
  signInDemoGoogle,
  signOutUser,
  PRESET_GOOGLE_ACCOUNTS,
} from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  user,
  onClose,
  onLoginSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  // Handler: Login Real via Supabase Google OAuth
  const handleGoogleOAuthLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await signInWithGoogleOAuth();
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Gagal memulai login Google.');
    }
    // Jika result.success dan URL tersedia, browser akan auto redirect ke Google Accounts
  };

  // Handler: 1-Click Demo Google Account Login
  const handleDemoLogin = (account: (typeof PRESET_GOOGLE_ACCOUNTS)[0]) => {
    const loggedIn = signInDemoGoogle({
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
    });
    if (onLoginSuccess) onLoginSuccess(loggedIn);
    onClose();
  };

  // Handler: Custom Google Email Login
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      alert('Email Google wajib diisi!');
      return;
    }
    const cleanEmail = customEmail.trim();
    const cleanName =
      customName.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ');

    const loggedIn = signInDemoGoogle({
      name: cleanName,
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@gmail.com`,
    });
    if (onLoginSuccess) onLoginSuccess(loggedIn);
    onClose();
  };

  // Handler: Logout
  const handleLogout = async () => {
    if (confirm('Apakah kamu yakin ingin keluar dari akun Google ini?')) {
      await signOutUser();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bottom-sheet auth-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        <div className="sheet-handle-bar" />

        {/* Modal Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: user ? '#ecfdf5' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <GoogleIcon size={18} />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800 }}>
                {user ? 'Profil Akun Google' : 'Masuk dengan Google'}
              </h2>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                {user
                  ? 'Tersambung ke Cloud SafeGrocer'
                  : 'Satu klik untuk simpan data di cloud'}
              </p>
            </div>
          </div>

          <button className="icon-action-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="sheet-body" style={{ padding: '16px 20px 24px' }}>
          {/* ======================= CASE A: SUDAH LOGIN ======================= */}
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Profile Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '18px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* User Avatar with Google Badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #ffffff',
                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
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
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                    }}
                    title="Terverifikasi Google"
                  >
                    <GoogleIcon size={13} />
                  </div>
                </div>

                {/* User Details */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#065f46',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      fontSize: '12px',
                      color: '#047857',
                      margin: '2px 0 6px 0',
                      wordBreak: 'break-all',
                    }}
                  >
                    {user.email}
                  </p>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: '#dcfce7',
                      border: '1px solid #86efac',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#166534',
                    }}
                  >
                    <ShieldCheck size={12} color="#16a34a" />
                    <span>
                      {user.provider === 'google'
                        ? 'Google OAuth Aktif'
                        : 'Akun Google Terhubung'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Info Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ color: '#64748b' }}>Sinkronisasi Cloud</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>
                    ● Otomatis Realtime
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ color: '#64748b' }}>User ID</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#475569',
                      fontFamily: 'monospace',
                    }}
                  >
                    {user.id.substring(0, 14)}...
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    border: '1px solid #fecaca',
                    background: '#fff1f2',
                    color: '#e11d48',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} />
                  <span>Keluar dari Akun (Logout)</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  Kembali ke Belanja
                </button>
              </div>
            </div>
          ) : (
            /* ======================= CASE B: BELUM LOGIN ======================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Highlight Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={20} color="#10b981" />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Akses Cloud Lintas Perangkat
                  </h4>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0', lineHeight: 1.35 }}>
                    Daftar belanja, struk kasir, dan patokan harga otomatis tersimpan di akun Google kamu.
                  </p>
                </div>
              </div>

              {/* Error Alert jika Google OAuth provider belum diaktifkan */}
              {errorMessage && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: '11.5px', color: '#92400e', lineHeight: 1.4 }}>
                    <strong>Pemberitahuan:</strong> {errorMessage}
                    <div style={{ marginTop: 6, fontWeight: 600, color: '#059669' }}>
                      💡 Tip: Kamu bisa langsung pakai tombol <strong>"Demo 1-Klik Google"</strong> di bawah untuk mencoba fitur tanpa setup!
                    </div>
                  </div>
                </div>
              )}

              {/* TOMBOL UTAMA: GOOGLE SIGN-IN RESMI */}
              <button
                type="button"
                className="google-sign-in-btn"
                onClick={handleGoogleOAuthLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <GoogleIcon size={22} />
                <span
                  style={{
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#1e293b',
                    letterSpacing: '-0.2px',
                  }}
                >
                  {isLoading ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google'}
                </span>
              </button>

              {/* Divider Pemisah */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  margin: '4px 0',
                }}
              >
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  atau coba cepat (1-klik)
                </span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>

              {/* Pilihan Akun Demo 1-Klik */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    margin: 0,
                  }}
                >
                  Pilih akun Google instan untuk pengujian langsung:
                </p>

                {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoLogin(acc)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '9px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.background = '#f0fdf4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span>{acc.name}</span>
                          <span
                            style={{
                              fontSize: '9.5px',
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '1px 5px',
                              borderRadius: '6px',
                              fontWeight: 700,
                            }}
                          >
                            {acc.role}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {acc.email}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '11px',
                        color: '#10b981',
                        fontWeight: 700,
                      }}
                    >
                      <span>Masuk</span>
                      <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Opsi Custom Google Account */}
              <div>
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>+ Ketik Nama & Email Google Pribadi</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleCustomSubmit}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                      Input Akun Google Kustom:
                    </div>

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nama Lengkap (Contoh: Rian Pratama)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      style={{ fontSize: '12px', padding: '8px 10px' }}
                    />

                    <input
                      type="email"
                      className="form-input"
                      placeholder="Email Google (contoh: kamu@gmail.com) *"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                      style={{ fontSize: '12px', padding: '8px 10px' }}
                    />

                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                      >
                        Masuk Sekarang
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowCustomInput(false)}
                        style={{ fontSize: '12px', padding: '8px 12px' }}
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Keamanan & Privacy Note */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                  marginTop: 6,
                  color: '#94a3b8',
                  fontSize: '10.5px',
                }}
              >
                <ShieldCheck size={13} color="#94a3b8" />
                <span>Otentikasi aman via Google Identity & Supabase Auth</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

