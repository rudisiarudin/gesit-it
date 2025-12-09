import { supabase } from "@/lib/supabaseClient";

// --- Interface Data ---
// Definisi interface untuk data yang akan dimasukkan (INSERT)
export interface NewDeviceData {
  name: string;
  type: string;
  location: string;
  ip: string; 
  ports: number;
  usage: number; // Biasanya 0 saat device baru ditambahkan
  status: string;
  department: string; // Tambahkan kolom department sesuai skema SQL
}

/**
 * Fungsi untuk menambahkan perangkat jaringan baru ke tabel network_devices di Supabase.
 * @param deviceData Objek berisi detail perangkat baru.
 * @returns Data perangkat yang baru saja dimasukkan (jika diperlukan).
 */
export async function addNetworkDevice(deviceData: NewDeviceData) {
  // 1. Membersihkan dan Mempersiapkan Data
  // Ubah string IP kosong menjadi null, sesuai dengan kolom skema DB yang non-required (opsional)
  const dataToInsert = {
    ...deviceData,
    ip: deviceData.ip || null,
    // Pastikan ports dan usage adalah angka, meskipun form sudah memprosesnya
    ports: Number(deviceData.ports),
    usage: Number(deviceData.usage),
  };

  // 2. Melakukan Operasi INSERT ke Supabase
  const { data, error } = await supabase
    .from('network_devices') // Pastikan nama tabel benar
    .insert([
      dataToInsert
    ])
    .select(); // Mengembalikan data yang baru dimasukkan

  // 3. Penanganan Error
  if (error) {
    console.error("Error inserting new network device:", error);
    // Melemparkan error agar bisa ditangkap oleh komponen formulir (AddDeviceForm)
    throw new Error(`Gagal menambahkan perangkat: ${error.message}.`);
  }

  // 4. Mengembalikan data yang berhasil ditambahkan
  return data;
}

// Anda bisa menambahkan fungsi-fungsi lain di sini, seperti:
// export async function updateNetworkDevice(id: number, updates: Partial<NewDeviceData>) { ... }
// export async function deleteNetworkDevice(id: number) { ... }
