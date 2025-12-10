// src/types.ts

// --- TIPE DATA MODUL GA ASSET ---

/**
 * Interface untuk data aset General Affairs (GA).
 */
export interface GAAsset {
    id: string;
    item_name: string;
    category: string;
    brand: string;
    serial_number: string;
    status: string; // Contoh: 'Available', 'In Use', 'Maintenance', 'Scrapped'
    location: string;
    user_assigned: string;
    remarks: string;
    qr_value: string;

    // Optional fields
    user_id?: string;
    image_url?: string;
    created_at?: string;
    no_plate?: string; // Khusus untuk kendaraan
    vehicle_type?: string; // Khusus untuk kendaraan
    condition?: string; // Contoh: 'Good', 'Fair', 'Poor'
    department?: string;
    purchase_date?: string;
    stnk_expiry?: string; // Khusus untuk kendaraan
}


// --- TIPE DATA MODUL JARINGAN (NETWORK) ---

/**
 * Status koneksi port pada switch.
 */
export enum PortStatus {
    ACTIVE = 'ACTIVE',
    IDLE = 'IDLE',
    FAULTY = 'FAULTY',
}

/**
 * Interface untuk setiap port pada switch.
 */
export interface SwitchPort {
    id: string;
    portNumber: number;
    status: PortStatus;
    vlan: number;
    ipAddress: string | null;
    deviceConnected: string | null; // Nama atau ID perangkat yang terhubung (PC, Server, Printer, dll)
    deviceType: 'PC' | 'SERVER' | 'PRINTER' | 'UPLINK' | 'AP' | 'OTHER';
    description: string;
}

/**
 * Interface untuk perangkat Switch Jaringan.
 */
export interface NetworkSwitch {
    id: string;
    name: string;
    ip: string;
    location: string;
    model: string;
    status: 'Active' | 'Offline' | 'Maintenance';
    totalPorts: number;
    uptime: string;
    ports: SwitchPort[];
}
