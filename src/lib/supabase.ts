import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseConfig } from '../types/grocery';

const STORAGE_KEY = 'smart_grocery_supabase_config';

/**
 * Ambil konfigurasi Supabase dari LocalStorage atau Environment Variables (.env)
 */
export function getSavedSupabaseConfig(): SupabaseConfig {
  const defaultUrl = 'https://wkrspzoixbkbpanoelvp.supabase.co';
  const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrcnNwem9peGJrYnBhbm9lbHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMTkwOTUsImV4cCI6MjEwNjg5NTA5NX0.WjoEXu6vBciDpjPVCKNUliLnX0j18HTY-qJlWYEUXfE';

  const envUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<SupabaseConfig>;
      if (parsed.url && parsed.anonKey && parsed.url.startsWith('https://') && parsed.url.includes('.supabase.co')) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
        };
      }
    }
  } catch (e) {
    console.warn('Gagal membaca saved supabase config:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

/**
 * Simpan konfigurasi Supabase ke LocalStorage
 */
export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Reset cached instance
    cachedClient = null;
  } catch (e) {
    console.error('Gagal menyimpan supabase config:', e);
  }
}

let cachedClient: SupabaseClient | null = null;

/**
 * Dapatkan instance Supabase client (atau null jika belum dikonfigurasi)
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSavedSupabaseConfig();
  if (config.url && config.anonKey && config.url.startsWith('https://')) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
        },
      });
      return cachedClient;
    } catch (e) {
      console.warn('Inisialisasi Supabase client gagal:', e);
      return null;
    }
  }

  return null;
}

/**
 * Uji koneksi ke Supabase dengan mencoba query ringan
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL dan Anon Key wajib diisi!' };
  }

  let cleanUrl = url.trim();
  // Auto-normalize if user pastes dashboard link e.g. https://supabase.com/dashboard/project/wkrspzoixbkbpanoelvp
  if (cleanUrl.includes('/dashboard/project/')) {
    const parts = cleanUrl.split('/dashboard/project/');
    if (parts[1]) {
      const ref = parts[1].replace(/\/.*$/, '').trim();
      cleanUrl = `https://${ref}.supabase.co`;
    }
  }

  if (!cleanUrl.startsWith('https://') || !cleanUrl.includes('.supabase.co')) {
    return {
      success: false,
      message: 'Format URL tidak valid. Harus diawali dengan https:// dan berakhiran .supabase.co',
    };
  }

  try {
    const tempClient = createClient(url, anonKey);
    // Mencoba ping tabel grocery_items
    const { error } = await tempClient.from('grocery_items').select('id').limit(1);

    if (error) {
      // Jika tabel belum dibuat, berikan informasi jelas
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Tersambung ke Supabase! Catatan: Tabel belum dibuat. Jalankan script schema SQL terlebih dahulu.',
        };
      }
      return { success: false, message: `Gagal akses Supabase: ${error.message}` };
    }

    return { success: true, message: 'Koneksi ke Supabase Cloud Berhasil & Tabel Siap!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Error koneksi: ${errorMsg}` };
  }
}
