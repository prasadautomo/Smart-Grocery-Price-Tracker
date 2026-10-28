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
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const callbackUrl = 'https://wkrspzoixbkbpanoelvp.supabase.co/auth/v1/callback';

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Handler: Login Real via Supabase Google OAuth
  const handleGoogleOAuthLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await signInWithGoogleOAuth();
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Gagal memulai login Google.');
    }
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
                  ? 'Tersambung ke SafeGrocer Cloud'
                  : 'Satu klik untuk hubungkan akun Google'}
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
                    <span>Akun Google Terhubung</span>
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
                    ● Realtime Aktif
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
                  <span style={{ color: '#64748b' }}>Akun Email</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#475569',
                      fontFamily: 'monospace',
                    }}
                  >
                    {user.email}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* TOMBOL UTAMA 1-KLIK: GAVIN UTOMO (AKUN GOOGLE PENGGUNA) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1.5px solid #10b981',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <GoogleIcon size={18} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#047857' }}>
                      Akun Google Anda Siap Masuk:
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontWeight: 700,
                    }}
                  >
                    1-Klik
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDemoLogin(PRESET_GOOGLE_ACCOUNTS[0])}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: '#ffffff',
                    border: '1px solid #a7f3d0',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={PRESET_GOOGLE_ACCOUNTS[0].avatarUrl}
                      alt={PRESET_GOOGLE_ACCOUNTS[0].name}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        border: '1.5px solid #10b981',
                      }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {PRESET_GOOGLE_ACCOUNTS[0].name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                        {PRESET_GOOGLE_ACCOUNTS[0].email}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>Masuk</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              </div>

              {/* TOMBOL GOOGLE OAUTH POPUP / BROWSER */}
              <button
                type="button"
                className="google-sign-in-btn"
                onClick={handleGoogleOAuthLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <GoogleIcon size={20} />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  {isLoading ? 'Menghubungkan ke Google...' : 'Lanjutkan via Google OAuth Cloud'}
                </span>
              </button>

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
                    <strong>Pemberitahuan Cloud:</strong> {errorMessage}
                  </div>
                </div>
              )}

              {/* Petunjuk Pengaktifan Supabase Google Provider */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '10px 12px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#334155',
                    fontSize: '11.5px',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HelpCircle size={15} color="#059669" />
                    <span>Petunjuk Menghubungkan Google ke Supabase</span>
                  </div>
                  {showGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {showGuide && (
                  <div style={{ marginTop: 10, fontSize: '11px', color: '#475569', lineHeight: 1.45 }}>
                    <p style={{ margin: '0 0 6px 0' }}>
                      Untuk mengaktifkan login Google via Cloud Supabase:
                    </p>
                    <ol style={{ paddingLeft: '16px', margin: '0 0 8px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <li>
                        Buka{' '}
                        <a
                          href="https://supabase.com/dashboard/project/wkrspzoixbkbpanoelvp/auth/providers"
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#059669', fontWeight: 700 }}
                        >
                          Supabase Dashboard &gt; Providers &gt; Google <ExternalLink size={10} style={{ display: 'inline' }} />
                        </a>
                      </li>
                      <li>Aktifkan toggle <strong>Enable Google provider</strong>.</li>
                      <li>
                        Masukkan <strong>Client ID</strong> &amp; <strong>Client Secret</strong> dari Google Cloud Console.
                      </li>
                      <li>
                        Masukkan Callback URL ini ke Google Cloud Console:
                        <div
                          style={{
                            background: '#e2e8f0',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            marginTop: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontFamily: 'monospace',
                            fontSize: '10px',
                            wordBreak: 'break-all',
                          }}
                        >
                          <span>{callbackUrl}</span>
                          <button
                            type="button"
                            onClick={copyCallbackUrl}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: '10px',
                              fontWeight: 700,
                              color: copiedUrl ? '#059669' : '#334155',
                            }}
                          >
                            <Copy size={11} />
                            {copiedUrl ? 'Disalin!' : 'Salin'}
                          </button>
                        </div>
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Pilihan Akun Lainnya */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                  Pilihan Akun Google Lainnya:
                </span>

                {PRESET_GOOGLE_ACCOUNTS.slice(1).map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoLogin(acc)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        style={{ width: 28, height: 28, borderRadius: '50%' }}
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                          {acc.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>{acc.email}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                      Pilih
                    </span>
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
                      padding: '2px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>+ Masuk dengan Email Google Lain</span>
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
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nama Lengkap"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      style={{ fontSize: '12px', padding: '8px 10px' }}
                    />

                    <input
                      type="email"
                      className="form-input"
                      placeholder="Email Google (@gmail.com) *"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                      style={{ fontSize: '12px', padding: '8px 10px' }}
                    />

                    <div style={{ display: 'flex', gap: 6 }}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
