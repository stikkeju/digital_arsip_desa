# Sistem Informasi Digitalisasi Arsip Desa

Sistem Informasi Digitalisasi Arsip Desa adalah aplikasi berbasis web yang dirancang khusus untuk memudahkan Operator Desa (Pemerintahan Desa) dalam mendata, melacak, dan menyimpan arsip **Surat Masuk** dan **Surat Keluar** secara digital. Aplikasi ini dikembangkan untuk meningkatkan efisiensi dan keamanan data kependudukan maupun administrasi desa.

## Fitur Utama

- **Penyimpanan Aman (Cloud-Based):** Semua dokumen pindaian (*scan*) akan dikompresi otomatis di sisi klien (browser) untuk menghemat ruang, lalu diunggah dan disimpan dengan aman menggunakan integrasi Google Drive.
- **Smart AI OCR Autofill:** Cukup unggah foto dokumen fisik atau kuitansi, dan sistem (menggunakan teknologi pengenalan karakter optik modern) akan secara otomatis membaca dan mengisi kolom formulir seperti Nomor Surat, Tanggal, Perihal, dan Nama Pemohon, sehingga meminimalisir kesalahan pengetikan manual (Typo).
- **Sistem Role-Based Access (RBAC):** Memiliki hak akses terpisah antara Admin (dapat mengubah pengaturan & hak akses) dan Operator (bertugas mendata arsip harian).
- **Dasbor Interaktif & Pencarian Cerdas:** Dilengkapi dengan ringkasan jumlah surat per periode (mingguan/bulanan), dan filter kode indeks otomatis.
- **Ekspor Laporan Otomatis:** Memungkinkan desa mengekspor daftar surat ke dalam format PDF standar A4 maupun Excel (XLSX) dengan format yang sudah disesuaikan persis seperti buku arsip fisik.

## Teknologi yang Digunakan

Aplikasi ini dibangun dengan *stack* modern untuk memastikan performa yang cepat dan pengalaman pengguna yang halus:
- **Frontend Framework:** SvelteKit (Svelte 5 Runes)
- **Styling:** Tailwind CSS v4 & Lucide Icons
- **Database & Auth:** Supabase (PostgreSQL + RLS Auth)
- **Penyimpanan File:** Google Drive API (OAuth2)
- **Kecerdasan Buatan:** Google Gemini API (OCR)
- **Pengolah Klien:** Browser Image Compression & jsPDF

## Cara Menjalankan Secara Lokal (Development)

1. Pastikan Anda telah menginstal **Node.js** (versi 18 ke atas).
2. Klon (*clone*) repositori ini ke komputer Anda.
3. Jalankan perintah instalasi dependensi:
   ```sh
   npm install
   ```
4. Salin file `.env.example` menjadi `.env` dan isi semua variabel kunci rahasia yang dibutuhkan (Supabase, Google Drive, Gemini API).
5. Jalankan *development server*:
   ```sh
   npm run dev
   ```
6. Buka `http://localhost:5173` di *browser* Anda.

## Kredit
Sistem ini awalnya dirancang dan dibangun oleh **Tim KKM Kelompok 96 Universitas Bina Bangsa Tahun 2026** sebagai bentuk pengabdian dan modernisasi administrasi untuk Pemerintah Desa Klutuk, Kecamatan Mekar Baru, Kabupaten Tangerang.
