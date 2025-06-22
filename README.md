# GESIT IT – Manajemen Aktivitas & Aset

GESIT IT adalah aplikasi berbasis web untuk mencatat aktivitas kerja, mengelola aset IT & GA, serta memantau data secara real-time dengan fitur filtering, export, dan QR code.

---

### ✨ Fitur Utama

**Activity Log**
- Tambah/Edit aktivitas kerja harian.
- Filter berdasarkan tanggal, status, dan kategori.
- Durasi dihitung otomatis jika status *Completed*.
- Export ke CSV, Excel, dan PDF.
- Role-based access: admin, staff, user.

**IT Asset Management**
- CRUD aset IT (Laptop, PC, Printer, dll).
- QR Code otomatis per item.
- Filter pencarian & pagination.
- Export Excel, download QR individu & batch.

**GA Asset Management**
- CRUD aset General Affair (Meja, Kendaraan, dll).
- ID otomatis: `GA-YYMMDD-KA-001`.
- Kendaraan: tambahan STNK expiry, jenis, dan nomor plat.
- Upload gambar & preview dari Supabase Storage.
- Filter, pagination, export, QR code.

**Autentikasi & Role**
- Login via Supabase Auth.
- Cek session & redirect otomatis.
- Hak akses berdasarkan role (admin/staff/user).

---

### 🚀 Teknologi yang Digunakan
- Next.js 14 (App Router)
- Supabase (Database, Auth, Storage, Realtime)
- Tailwind CSS
- Lucide-react
- xlsx & jspdf (untuk export)
- qrcode.react (QR Code)
- sonner (toast notification)

---

### 🛠 Struktur Folder

```
/app
  └── dashboard
      ├── activity-log/
      ├── it-assets/
      └── ga-assets/
/components
  ├── ActivityLog/
  ├── ITAssetList/
  ├── GAAssetList/
  ├── Export/
  └── hooks/
      ├── usePagination.ts
      └── useUserRole.ts
/lib
  └── supabaseClient.ts
```

---

### ⚙️ Cara Menjalankan

1. Clone repository:
```
git clone https://github.com/namamu/gesit-it.git
cd gesit-it
```

2. Install dependencies:
```
npm install
```

3. Buat file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. Jalankan lokal:
```
npm run dev
```

---

### 🔐 Role-Based Access

| Role     | Activity Log | IT Assets | GA Assets |
|----------|--------------|-----------|-----------|
| admin    | CRUD + Export | CRUD      | CRUD      |
| staff    | Tambah/Edit   | CRUD      | CRUD      |
| user     | View Only     | View Only | View Only |

---

### 📦 Setup Supabase

- Tabel: `activities`, `it_assets`, `ga_assets`
- Storage bucket: `images` (untuk upload gambar aset GA)
- Auth: gunakan `user_metadata.full_name` sebagai nama pengguna (fallback ke `email` jika kosong)

---

### 📄 Lisensi
MIT License © 2025 – GESIT IT Team
