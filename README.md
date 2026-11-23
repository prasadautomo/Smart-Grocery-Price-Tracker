# Cartly — Smart Grocery & Price Tracker

Cartly adalah aplikasi belanja mobile yang dibuat dengan HTML, CSS, dan JavaScript. Data disimpan di browser dan dapat disinkronkan antarperangkat menggunakan akun Supabase.

## Fitur

- Daftar belanja dan troli dengan toko, tanggal, jumlah, harga, dan validasi.
- Subtotal realtime, diskon bertingkat, perbandingan harga, dan peringatan anggaran.
- Penyimpanan lokal serta service worker yang menyimpan berkas aplikasi untuk pemuatan ulang. Sinkronisasi cloud dan pustaka tampilan eksternal tetap memerlukan internet.
- Login email/password Supabase, data tiap akun, dan pembaruan Realtime.
- Riwayat struk, rencana belanja, pemindai barcode, dan analisis pengeluaran.

## Menjalankan secara lokal

Gunakan Node.js 20 atau yang lebih baru:

```bash
npm run dev
```

Buka <http://127.0.0.1:3000>. Server pengembangan hanya mendengarkan komputer lokal. Server ini menyediakan aplikasi dan endpoint `/api/health`, `/api/insights`, `/api/scan-python`, serta `/api/payments/qris`.

## Pengaturan Supabase

1. Buat proyek Supabase, lalu buka SQL Editor.
2. Jalankan [`supabase/schema.sql`](./supabase/schema.sql). Skema ini mengatur tabel per akun dan Row Level Security, mengaktifkan tabel Realtime, serta menutup akses tabel demo lama.
3. Buka **Authentication → Providers → Email** dan aktifkan login email/password. Agar pengguna langsung masuk setelah mendaftar, matikan **Confirm email**.
4. Atur Site URL dan alamat redirect untuk domain lokal dan situs yang sudah di-deploy.

Untuk proyek yang sudah berjalan, jalankan ulang skema tersebut untuk melengkapi kolom profil dan metode pembayaran. Data lama tanpa pemilik tetap tersimpan, tetapi tidak diberikan kepada akun secara otomatis.

Aplikasi memakai Supabase publishable key dari `app.js`; kunci ini memang untuk aplikasi browser. Jangan menaruh service-role key di sisi browser. Akses tabel tetap dilindungi kebijakan RLS.

## Pembayaran QRIS Midtrans

Checkout membuat QRIS dinamis melalui Midtrans dan memeriksa status transaksi dari backend. Akun merchant harus aktif untuk pembayaran QRIS/GoPay.

Atur variabel berikut di **Vercel → Project Settings → Environment Variables**:

- `MIDTRANS_SERVER_KEY`: Server Key merchant Midtrans, simpan sebagai rahasia server.
- `MIDTRANS_IS_PRODUCTION`: isi `true` untuk pembayaran sungguhan. Gunakan `false` hanya saat menguji di lingkungan sandbox.

Tanpa kedua pengaturan tersebut, QRIS tidak dibuat dan checkout tidak mencatat pembayaran. Antarmuka menandai pembayaran sandbox sebagai **LINGKUNGAN UJI**. Contoh nama variabel tersedia di [`.env.example`](./.env.example); jangan commit kunci merchant. Setelah mengubah variabel Vercel, deploy ulang agar fungsi pembayaran memakai konfigurasi baru.

## Build dan deploy

```bash
npm run build
```

Build menyalin aplikasi dan aset yang dipakai ke `dist/`. `vercel.json` mengatur situs PWA dan endpoint TypeScript. Hubungkan repositori ke Vercel dan deploy dari branch `main`.

## Pemeriksaan

```bash
npm test
npm run typecheck
npm run build
```

Pemeriksaan kalkulasi memakai test runner bawaan Node.js.
