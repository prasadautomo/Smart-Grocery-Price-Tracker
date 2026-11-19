# 🛒 Smart Grocery & Price Tracker (Mobile PWA)
> **Modul Pertemuan 12 - 14: Mobile PWA Rekayasa Perangkat Lunak & Logika Belanja Cerdas**  
> *Solusi Pengendali Anggaran Belanja Bulanan Anak Rantau (Kasus Rian)*

---

## 📱 Gambaran Proyek

Aplikasi **Smart Grocery & Price Tracker** adalah Progressive Web App (PWA) berbasis **React 19 + TypeScript + Vite** yang dirancang dengan ergonomi mobile native (*thumb-friendly*, max width 430px centered) untuk digunakan saat mendorong troli supermarket dengan satu tangan.

Aplikasi ini mengatasi 3 dilema belanja utama:
1. **Anti-Malu di Kasir:** Total belanjaan di troli selalu terhitung realtime dengan indikator *Budget Safety Cap* (Hijau / Kuning / Merah).
2. **Anti-Jebakan Promo Bertingkat:** Kalkulator cerdas untuk promo bertumpuk (contoh: 50% + 20% = efektif 60%, bukan 70%) serta pembanding harga per liter/kemasan (1L vs 5L).
3. **Struk Digital Anti-Pudar & Komparator Harga:** Menyimpan data belanja permanen dan menampilkan indikator tren harga realtime (↑ Merah / ↓ Hijau / = Stabil) dibandingkan bulan lalu.

---

## 🚀 Fitur Sesuai Checklist SRS (Software Requirements Specification)

| Kode | Nama Fitur | Status | Deskripsi Implementasi |
| :--- | :--- | :---: | :--- |
| **F-01** | **Pencatatan Item Belanja Lengkap** | ✅ Selesai | Form memvalidasi nama, kategori, satuan, kuantitas bulat positif, harga positif, toko aktif, dan tanggal belanja. |
| **F-02** | **Perhitungan Kuantitas Otomatis** | ✅ Selesai | Stepper kuantitas (+ / -) ramah sentuhan jempol yang seketika mengalikan harga satuan ke total baris item. |
| **F-03** | **Kalkulator Diskon Bertingkat** | ✅ Selesai | Menangani diskon tunggal (%), diskon bertumpuk (e.g. 50% + 20%), dan potongan tunai langsung (Rp) dengan formula matematika presisi. |
| **F-04** | **Komparator Harga Realtime vs Bulan Lalu** | ✅ Selesai | Riwayat harga disimpan per toko dan bulan; indikator menunjukkan naik merah, turun hijau, atau stabil. |
| **F-05** | **Pengendali Anggaran (Safety Cap)** | ✅ Selesai | Hijau di bawah 90%, peringatan kuning pada 90–100%, dan banner merah saat melewati 100%. |
| **F-06A** | **Persistensi Data Lokal** | ✅ Selesai | Keranjang, limit, toko, tanggal, dan riwayat harga memakai LocalStorage dan bertahan setelah reload. |
| **F-06B** | **Sinkronisasi Antar-Perangkat** | ⚠️ Supabase Realtime | Listener Broadcast dan perubahan tabel Supabase memperbarui perangkat lain; proyek ini belum dikonfigurasi dengan Firebase Firestore `onSnapshot()`. |
| **UX** | **Ergonomi Mobile** | ✅ Selesai | Input angka, tombol sentuh minimal 44 px, pesan troli kosong, toast non-blocking, serta dialog konfirmasi hapus. |
| **F-07** | **Checklist Lorong Toko & Prioritas** | ✅ Selesai | Centang barang interaktif saat mengambil di rak fisik + klasifikasi Wajib (Pokok) vs Jajan (Opsional). |
| **F-08** | **Auto-Trim Over-Budget Optimizer** | ✅ Selesai | Tombol 1-klik pangkas otomatis barang jajan jika total troli melebihi batas anggaran bulanan. |
| **F-09** | **Katalog Cepat 1-Tap Produk Rutin** | ✅ Selesai | Modal katalog instan kebutuhan anak kos (Beras, Minyak, Telur, Indomie, Sabun) dengan patokan harga otomatis. |
| **F-10** | **Bagikan WhatsApp & Salin Catatan** | ✅ Selesai | Ekspor checklist belanja rapi terkelompok per kategori langsung ke chat WhatsApp atau clipboard. |
| **F-11** | **Kalkulator Biaya Tambahan Kasir** | ✅ Selesai | Simulasi biaya kantong kresek/spunbond, biaya parkir motor/mobil, dan pajak PPN 11% sebelum bayar. |
| **F-12** | **Grafik & Analisis Visual Kategori** | ✅ Selesai | Dashboard statistik kumulatif, tren pengeluaran antar-trip, dan breakdown visual pengeluaran per kategori. |

---

## ⚡ Arsitektur Teknologi & Integrasi

- **Frontend Core:** React 19, TypeScript, Vite
- **UI & Ergonomi:** Native Mobile Frame (430px), Glassmorphism, Lucide React Icons
- **PWA Ready:** Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Apple Mobile Web App tags
- **Database Hybrid:**
  - **Offline/Default:** LocalStorage browser dengan *seed data* realistis kasus Rian
  - **Cloud:** Terintegrasi penuh dengan **Supabase** via `@supabase/supabase-js`
- **Sinkronisasi Langsung:** Supabase Realtime Broadcast dan `postgres_changes`, dengan polling cadangan saat listener terputus.
- **Hosting / Deployment:** Siap deploy ke **Vercel** (`vercel.json` SPA rewrite & header PWA telah terkonfigurasi)

---

## ☁️ Panduan Integrasi Supabase Cloud

Aplikasi ini memiliki fitur **Dual Sync**: dapat langsung digunakan secara offline (LocalStorage) dan dapat dihubungkan ke Supabase Cloud.

### 1. Buat Tabel di Supabase SQL Editor
1. Buka [Supabase Dashboard](https://supabase.com) dan buat proyek baru.
2. Buka menu **SQL Editor**.
3. Buka file [`supabase/schema.sql`](./supabase/schema.sql) di folder proyek ini.
4. Salin seluruh kodenya, tempel ke SQL Editor Supabase, lalu klik **Run**.

### 2. Hubungkan ke Aplikasi
Ada dua cara mudah:
- **Cara 1 (Langsung dari Tampilan Aplikasi):**
  1. Buka tab **Pengaturan** di aplikasi.
  2. Klik **Kelola Koneksi & Sinkronkan**.
  3. Masukkan **Supabase Project URL** dan **Anon API Key** kamu.
  4. Klik **Uji Koneksi**, lalu klik **Simpan & Sinkronkan Data Cloud**.
- **Cara 2 (Environment Variables):**
  1. Buat file `.env.local` di root folder (contoh pada [`.env.example`](./.env.example)):
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

### 3. Aktifkan login langsung tanpa konfirmasi email
Cartly menggunakan email dan password. Setelah pendaftaran, pengguna langsung masuk tanpa membuka email konfirmasi.

1. Di Supabase Dashboard, buka **Authentication → Providers** dan aktifkan provider **Email**.
2. Pada pengaturan provider **Email**, matikan **Confirm email**. Jika opsi ini masih aktif, Supabase tidak memberi sesi login saat pendaftaran dan Cartly akan memberi tahu agar pengaturan diubah.
3. Atur **Site URL** dan **Redirect URLs** agar memuat alamat aplikasi yang digunakan, termasuk domain Vercel dan alamat lokal saat pengembangan.
4. Jalankan SQL schema di langkah pertama agar tabel profil, trigger sinkronisasi email, dan kebijakan akses profil tersedia. Setiap pengguna hanya dapat membaca profilnya sendiri.

Dengan **Confirm email** dimatikan, Supabase langsung menganggap alamat email sudah terkonfirmasi. Pengguna bisa mendaftar memakai alamat email yang bukan miliknya.

---

## 🌐 Panduan Deployment ke Vercel

Proyek ini telah dilengkapi file [`vercel.json`](./vercel.json) sehingga dapat langsung di-deploy tanpa konfigurasi tambahan:

### Menggunakan Git (GitHub / GitLab):
1. Push folder proyek ini ke repositori GitHub kamu.
2. Buka [Vercel Dashboard](https://vercel.com) dan klik **Add New Project**.
3. Import repositori GitHub kamu.
4. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`: URL project Supabase kamu
   - `VITE_SUPABASE_ANON_KEY`: Anon Key Supabase kamu
5. Klik **Deploy**. Website PWA kamu akan live dalam beberapa detik!

### Menggunakan Vercel CLI:
```bash
npx vercel
```

---

## 💻 Cara Menjalankan di Komputer Lab / Lokal

1. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
2. Buka browser di alamat:
   ```
   http://127.0.0.1:5173/
   ```
3. **Simulasi Tampilan Mobile di Chrome DevTools:**
   - Tekan **F12** pada keyboard untuk membuka Chrome DevTools.
   - Tekan **Ctrl + Shift + M** (Toggle Device Toolbar) dan pilih perangkat (contoh: *iPhone 14 Pro* atau *Pixel 7*).

---

## 🧪 Validasi Pengujian Mandiri
Untuk memverifikasi formula matematika kalkulator diskon bertingkat dan komparator harga:
```bash
node test_calculations.mjs
```
Hasil: Seluruh logika matematis lolos uji 100% presisi.
