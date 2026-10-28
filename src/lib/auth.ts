import { getSupabaseClient } from './supabase';
import type { UserProfile } from '../types/auth';

const USER_STORAGE_KEY = 'smart_grocery_auth_user';

type AuthListener = (user: UserProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: UserProfile | null) {
  listeners.forEach((cb) => {
    try {
      cb(user);
    } catch (err) {
      console.error('Error in auth listener:', err);
    }
  });
}

/**
 * Daftar Akun Demo Google Cepat untuk pengujian instan (1-Klik)
 */
export const PRESET_GOOGLE_ACCOUNTS: Array<{
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}> = [
  {
    name: 'Rian Pratama',
    email: 'rian.pratama@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Siswa Rantau / Anak Kos',
  },
  {
    name: 'Siti Rahma',
    email: 'siti.rahma@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'Pengelola Anggaran Hemat',
  },
  {
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'Mahasiswa Tingkat Akhir',
  },
];

/**
 * Konversi Supabase User ke UserProfile standar aplikasi
 */
function mapSupabaseUser(sbUser: any): UserProfile {
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    name: meta.full_name || meta.name || sbUser.email?.split('@')[0] || 'Pengguna Google',
    email: sbUser.email || '',
    avatarUrl:
      meta.avatar_url ||
      meta.picture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(meta.full_name || 'Google User')}&background=10b981&color=fff`,
    provider: 'google',
    createdAt: sbUser.created_at,
    lastLogin: new Date().toISOString(),
  };
}

/**
 * Dapatkan user aktif (dari Supabase auth session atau storage lokal)
 */
export function getSavedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch (err) {
    console.warn('Gagal membaca saved user:', err);
  }
  return null;
}

/**
 * Inisialisasi Auth State (mengecek session Supabase aktif dan menangani OAuth callback)
 */
export async function initializeAuth(): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client.auth.getSession();
      if (data?.session?.user) {
        const profile = mapSupabaseUser(data.session.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        notifyListeners(profile);
        return profile;
      }
    } catch (e) {
      console.warn('Gagal membaca Supabase session:', e);
    }
  }

  // Fallback ke saved local user jika tidak ada session Supabase
  const localUser = getSavedUser();
  notifyListeners(localUser);
  return localUser;
}

/**
 * 1. Login dengan Google OAuth Asli (Supabase)
 */
export async function signInWithGoogleOAuth(): Promise<{
  success: boolean;
  message?: string;
  url?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase client belum terhubung. Periksa konfigurasi Supabase terlebih dahulu.',
    };
  }

  try {
    // Alamat redirect kembali ke aplikasi setelah Google OAuth consent
    const redirectUrl = window.location.origin + window.location.pathname;

    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      // Deteksi error jika Google provider belum diaktifkan di dashboard Supabase
      if (
        error.message.toLowerCase().includes('provider is not enabled') ||
        error.message.toLowerCase().includes('unsupported provider')
      ) {
        return {
          success: false,
          message:
            'Google Provider belum diaktifkan di Supabase Dashboard kamu. Kamu bisa mengaktifkannya di Dashboard > Authentication > Providers > Google, atau gunakan opsi "Demo Login Google" di bawah ini.',
        };
      }
      return { success: false, message: error.message };
    }

    if (data?.url) {
      // Supabase mengembalikan URL Google OAuth consent screen
      window.location.href = data.url;
      return { success: true, url: data.url };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Gagal menghubungkan ke Google: ${errorMsg}` };
  }
}

/**
 * 2. Login Cepat Simulasi Akun Google (1-Klik Tanpa Perlu Setup Cloud Console)
 */
export function signInDemoGoogle(account?: {
  name: string;
  email: string;
  avatarUrl?: string;
}): UserProfile {
  const base = account || PRESET_GOOGLE_ACCOUNTS[0];
  const demoProfile: UserProfile = {
    id: `g_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: base.name,
    email: base.email,
    avatarUrl:
      base.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(base.name)}&background=10b981&color=fff`,
    provider: 'demo_google',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoProfile));
  notifyListeners(demoProfile);
  return demoProfile;
}

/**
 * Logout / Keluar dari Akun
 */
export async function signOutUser(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut notice:', e);
    }
  }

  localStorage.removeItem(USER_STORAGE_KEY);
  notifyListeners(null);
}

/**
 * Berlangganan perubahan Auth State (Supabase onAuthStateChange & event lokal)
 */
export function subscribeAuthState(callback: AuthListener): () => void {
  listeners.add(callback);

  // Supabase Auth listener
  const client = getSupabaseClient();
  let subscription: { unsubscribe: () => void } | null = null;

  if (client) {
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const profile = mapSupabaseUser(session.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        notifyListeners(profile);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(USER_STORAGE_KEY);
        notifyListeners(null);
      }
    });
    subscription = data.subscription;
  }

  // Cross-tab storage listener
  const handleStorage = (e: StorageEvent) => {
    if (e.key === USER_STORAGE_KEY) {
      if (e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
    if (subscription) {
      subscription.unsubscribe();
    }
  };
}

