// src/constants.ts

import { GAAsset, NetworkSwitch, PortStatus } from './types';

// --- CONSTANTS UNTUK GA ASSET ---

/**
 * Default form state untuk GAAsset.
 */
export const emptyGAAssetForm: GAAsset = {
    id: '',
    item_name: '',
    category: '',
    brand: '',
    serial_number: '',
    status: 'Available', // Default status
    location: '',
    user_assigned: '',
    remarks: '',
    qr_value: '',

    // Optional defaults
    user_id: '',
    image_url: '',
    created_at: new Date().toISOString(),
    no_plate: '',
    vehicle_type: '',
    condition: 'Good',
    department: '',
    purchase_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    stnk_expiry: '',
};

// --- CONSTANTS UNTUK MOCK DATA JARINGAN ---

/**
 * Data Switch Port Mock
 */
const MOCK_PORTS_SW1: SwitchPort[] = [
    // Uplink
    { id: 'p1_1', portNumber: 1, status: PortStatus.ACTIVE, vlan: 10, ipAddress: '192.168.10.1', deviceConnected: 'Router Main', deviceType: 'UPLINK', description: 'Koneksi ke Router Utama' },
    // PC dan Idle
    { id: 'p1_2', portNumber: 2, status: PortStatus.ACTIVE, vlan: 20, ipAddress: '192.168.20.15', deviceConnected: 'PC Staff A', deviceType: 'PC', description: 'PC Kerja Staff' },
    { id: 'p1_3', portNumber: 3, status: PortStatus.IDLE, vlan: 20, ipAddress: null, deviceConnected: null, deviceType: 'PC', description: 'Port cadangan meja B' },
    // Server
    { id: 'p1_4', portNumber: 4, status: PortStatus.ACTIVE, vlan: 10, ipAddress: '192.168.10.5', deviceConnected: 'NAS FileServer', deviceType: 'SERVER', description: 'Network Attached Storage' },
    // Faulty
    { id: 'p1_5', portNumber: 5, status: PortStatus.FAULTY, vlan: 30, ipAddress: null, deviceConnected: null, deviceType: 'OTHER', description: 'Port rusak, butuh perbaikan' },
    // Access Point
    { id: 'p1_6', portNumber: 6, status: PortStatus.ACTIVE, vlan: 40, ipAddress: '192.168.40.10', deviceConnected: 'AP Lobby', deviceType: 'AP', description: 'Access Point Area Lobby' },
];

const MOCK_PORTS_SW2: SwitchPort[] = [
    { id: 'p2_1', portNumber: 1, status: PortStatus.ACTIVE, vlan: 10, ipAddress: '192.168.10.2', deviceConnected: 'Switch Lt 1', deviceType: 'UPLINK', description: 'Uplink ke Switch Lt 1' },
    { id: 'p2_2', portNumber: 2, status: PortStatus.ACTIVE, vlan: 20, ipAddress: '192.168.20.22', deviceConnected: 'PC Manager', deviceType: 'PC', description: 'PC Manager Ruang A' },
    { id: 'p2_3', portNumber: 3, status: PortStatus.IDLE, vlan: 20, ipAddress: null, deviceConnected: null, deviceType: 'PC', description: 'Cadangan' },
    { id: 'p2_4', portNumber: 4, status: PortStatus.ACTIVE, vlan: 30, ipAddress: '192.168.30.1', deviceConnected: 'Printer HR', deviceType: 'PRINTER', description: 'Printer Divisi HR' },
];


/**
 * Array Mock Switch Jaringan untuk NetworkDashboard.
 */
export const MOCK_SWITCHES: NetworkSwitch[] = [
    {
        id: 'sw-001',
        name: 'Core Switch Lt. 2',
        ip: '192.168.1.254',
        location: 'Server Room Lt 2',
        model: 'Cisco Catalyst 2960',
        status: 'Active',
        totalPorts: 24,
        uptime: '34 days, 5 hours',
        ports: MOCK_PORTS_SW1.concat(Array.from({ length: 18 }).map((_, i) => ({
             id: `p1_${i+7}`, portNumber: i+7, status: PortStatus.IDLE, vlan: 20, ipAddress: null, deviceConnected: null, deviceType: 'OTHER', description: 'Port Free' 
        }))),
    },
    {
        id: 'sw-002',
        name: 'Access Switch Lobby',
        ip: '192.168.1.150',
        location: 'Lobby Utama',
        model: 'Ubiquiti EdgeSwitch 16',
        status: 'Active',
        totalPorts: 16,
        uptime: '5 days, 12 hours',
        ports: MOCK_PORTS_SW2.concat(Array.from({ length: 12 }).map((_, i) => ({
             id: `p2_${i+5}`, portNumber: i+5, status: PortStatus.IDLE, vlan: 40, ipAddress: null, deviceConnected: null, deviceType: 'OTHER', description: 'Port Free' 
        }))),
    },
    {
        id: 'sw-003',
        name: 'Switch Ruang Meeting',
        ip: '192.168.1.151',
        location: 'Ruang Meeting B',
        model: 'D-Link DGS-1008D',
        status: 'Offline',
        totalPorts: 8,
        uptime: '0 days',
        ports: [],
    }
];
