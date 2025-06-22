# GESIT IT - Manajemen Aktivitas & Aset

**GESIT IT** adalah aplikasi berbasis web untuk mencatat aktivitas kerja, mengelola aset IT & GA, serta memantau data secara real-time dengan fitur filtering, export, dan QR code.

## ✨ Fitur Utama

### ✅ Activity Log
- Tambah/Edit aktivitas kerja harian.
- Filter berdasarkan tanggal, status, dan kategori.
- Perhitungan otomatis durasi jika status *Completed*.
- Export ke **CSV**, **Excel**, dan **PDF**.
- Role-based access: `admin`, `staff`, `user`.

### ✅ IT Asset Management
- CRUD aset IT (Laptop, PC, Printer, dll).
- QR Code otomatis per item.
- Filter pencarian & pagination.
- Export Excel, download QR individu & batch.

### ✅ GA Asset Management
- CRUD aset General Affair (Meja, Kendaraan, dll).
- ID otomatis berbasis tanggal & kategori: `GA-YYMMDD-KA-001`.
- Fitur khusus untuk kendaraan: STNK, jenis, nomor plat.
- Upload gambar & preview dari Supabase Storage.
- Pencarian, pagination, export & QR.

### ✅ Auth & Role
- Autentikasi via Supabase Auth.
- Session check & redirect.
- Role-based access untuk mengatur hak akses.

---

## 🚀 Teknologi

- **Next.js 14 / App Router**
- **Supabase** (Database, Auth, Storage, Realtime)
- **Tailwind CSS**
- **Lucide-react** (icon)
- **xlsx**, **jspdf** (export data)
- **QRCode.react** (QR Code)
- **sonner** (toast/alert)

---

## 🛠️ Struktur Proyek

