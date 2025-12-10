import { supabase } from "@/lib/supabaseClient"; // Sesuaikan path ini jika perlu

// --- Interface Data ---
export interface NewDeviceData {
  name: string;
  type: string;
  location: string;
  ip: string; 
  ports: number;
  usage: number; 
  status: string;
  department: string; 
}

/**
 * Fungsi untuk menambahkan perangkat jaringan baru ke tabel network_devices di Supabase.
 * @param deviceData Objek berisi detail perangkat baru.
 */
export async function addNetworkDevice(deviceData: NewDeviceData) {
  const dataToInsert = {
    ...deviceData,
    ip: deviceData.ip || null,
    ports: Number(deviceData.ports),
    usage: Number(deviceData.usage),
  };

  const { data, error } = await supabase
    .from('network_devices') 
    .insert([
      dataToInsert
    ])
    .select(); 

  if (error) {
    console.error("Error inserting new network device:", error);
    throw new Error(`Gagal menambahkan perangkat: ${error.message}`);
  }

  return data;
}
