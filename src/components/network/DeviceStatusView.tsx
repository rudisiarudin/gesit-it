'use client';

import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  Clock, 
  Edit2, 
  Loader2,
  Server,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Save
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from "@/lib/supabaseClient"; 

// --- Interfaces Data ---

// Interface dasar perangkat (Network Device)
interface DeviceDetail {
    id: number;
    name: string;
    type: string;
    location: string;
    ip: string;
    ports: number;
    usage: number; 
    status: string; 
    uptime_days: number;
    uptime_hours: number;
    uptime_minutes: number;
}

// Interface Detail Port (Device Port)
interface PortDetail {
    id: number;
    device_id: number;
    port_number: number;
    status: 'ACTIVE' | 'IDLE' | 'FAULTY';
    connected_device: string; 
    ip_assigned: string; 
    vlan: number;
    port_type: string; 
}

interface DeviceStatusViewProps {
    deviceId: number | null;
    onClose: () => void;
    onDeviceUpdated: () => void; 
}

// --- FUNGSI MOCK/SIMULASI UNTUK PORT ---

/**
 * Simulasi Fetch Port Data (Menggantikan panggilan Supabase nyata)
 */
async function fetchDevicePorts(deviceId: number, totalPorts: number): Promise<PortDetail[]> {
    // --- Simulasi data yang konsisten dengan total ports ---
    const ports: PortDetail[] = [];
    for (let i = 1; i <= totalPorts; i++) {
        // Mocking status, IP, dan connected_device untuk beberapa port pertama
        let status: 'ACTIVE' | 'IDLE' | 'FAULTY' = 'IDLE';
        let connected_device = '-';
        let ip_assigned = '';
        let vlan = 1;
        let port_type = 'USER';

        if (i === 1) { // Port 1: Uplink/WAN
            status = 'ACTIVE';
            connected_device = 'WAN/ISP';
            vlan = 0;
            port_type = 'WAN';
        } else if (i === 2) { // Port 2: Distribution Switch
            status = 'ACTIVE';
            connected_device = 'Distribution Switch F1';
            ip_assigned = '192.168.1.10';
            vlan = 10;
            port_type = 'UPLINK';
        } else if (i === 5) { // Port 5: PC User
            status = 'ACTIVE';
            connected_device = 'PC User A05';
            ip_assigned = '192.168.10.50';
            vlan = 20;
            port_type = 'PoE';
        } else if (i > totalPorts - 2) { // Dua port terakhir (Simulasi IDLE/FAULTY)
            status = i === totalPorts ? 'FAULTY' : 'IDLE';
            port_type = 'USER';
        }

        ports.push({
            id: i + deviceId * 1000,
            device_id: deviceId,
            port_number: i,
            status,
            connected_device,
            ip_assigned,
            vlan,
            port_type,
        });
    }
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return ports;
}

/**
 * Simulasi Update Port Data (Menggantikan panggilan Supabase nyata)
 */
async function updatePortDetail(portData: PortDetail): Promise<PortDetail> {
    // --- Simulasi Logic Save ke Supabase 'device_ports' ---
    console.log(`[DB Sim] Updating Port ${portData.port_number} on Device ${portData.device_id}`, portData);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    return portData;
}


// --- Sub Komponen: Form Edit Device ---
// (Ini sama dengan script sebelumnya, untuk edit IP, Nama, Lokasi, dll. di tabel network_devices)
interface EditFormProps {
    device: DeviceDetail;
    onSave: (updates: Partial<DeviceDetail>) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}

const EditDeviceForm: React.FC<EditFormProps> = ({ device, onSave, onCancel, isSaving }) => {
    // ... (Logika dan JSX EditDeviceForm sama dengan script sebelumnya) ...
    const [formData, setFormData] = useState<Partial<DeviceDetail>>({
        name: device.name,
        ip: device.ip,
        location: device.location,
        type: device.type,
        ports: device.ports,
        status: device.status,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value) : value 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-slate-800">Edit Detail Perangkat</h4>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-gray-700 text-sm">Nama Perangkat</span>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm" />
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Alamat IP</span>
                    <input type="text" name="ip" value={formData.ip || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm" />
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Lokasi (Ruangan)</span>
                    <input type="text" name="location" value={formData.location || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm" />
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Total Ports</span>
                    <input type="number" name="ports" value={formData.ports || 0} onChange={handleChange} min="0" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm" />
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Tipe</span>
                    <select name="type" value={formData.type || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm">
                        <option>Router/Switch</option>
                        <option>Access Switch</option>
                        <option>Patch Panel</option>
                        <option>Media Converter</option>
                        <option>Hub/Repeater</option>
                    </select>
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Status Operasi</span>
                    <select name="status" value={formData.status || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm">
                        <option>Active</option>
                        <option>Maintenance</option>
                        <option>Pending</option>
                        <option>Decommissioned</option>
                    </select>
                </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-100">
                    Batal
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                    {isSaving ? <Loader2 size={16} className="animate-spin mr-1 inline-block" /> : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    );
};


// --- Sub Komponen: Row Port yang Dapat Diedit ---
interface EditablePortRowProps {
    port: PortDetail;
    onUpdate: (port: PortDetail) => void;
    isSaving: boolean;
}

const EditablePortRow: React.FC<EditablePortRowProps> = ({ port, onUpdate, isSaving }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [tempData, setTempData] = useState<PortDetail>(port);

    const statusColor = {
        'ACTIVE': 'bg-green-100 text-green-800',
        'IDLE': 'bg-red-100 text-red-800',
        'FAULTY': 'bg-yellow-100 text-yellow-800',
    }[port.status];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setTempData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value) : value 
        } as PortDetail));
    };

    const handleSave = () => {
        onUpdate(tempData);
        setIsEditMode(false);
    };

    if (isEditMode) {
        return (
            <tr className="bg-blue-50/50">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">ETH {port.port_number}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <select name="status" value={tempData.status} onChange={handleChange} className="w-full border rounded p-1 text-xs">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="IDLE">IDLE</option>
                        <option value="FAULTY">FAULTY</option>
                    </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <input type="text" name="connected_device" value={tempData.connected_device} onChange={handleChange} className="w-full border rounded p-1 text-xs" placeholder="Perangkat Terhubung" />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <input type="text" name="ip_assigned" value={tempData.ip_assigned} onChange={handleChange} className="w-full border rounded p-1 text-xs" placeholder="IP" />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <input type="number" name="vlan" value={tempData.vlan} onChange={handleChange} className="w-full border rounded p-1 text-xs" min="0" />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <select name="port_type" value={tempData.port_type} onChange={handleChange} className="w-full border rounded p-1 text-xs">
                        <option>USER</option>
                        <option>UPLINK</option>
                        <option>WAN</option>
                        <option>PoE</option>
                    </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                    <button onClick={handleSave} disabled={isSaving} className="text-green-600 hover:text-green-800 disabled:opacity-50">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                    <button onClick={() => setIsEditMode(false)} className="text-gray-500 hover:text-gray-700 ml-2">
                        <XCircle size={16} />
                    </button>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">ETH {port.port_number}</td>
            <td className="px-3 py-2 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                    {port.status.charAt(0) + port.status.slice(1).toLowerCase()}
                </span>
            </td>
            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{port.connected_device}</td>
            <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-blue-600">{port.ip_assigned || '-'}</td>
            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{port.vlan}</td>
            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{port.port_type}</td>
            <td className="px-3 py-2 whitespace-nowrap text-right">
                <button onClick={() => setIsEditMode(true)} className="text-yellow-600 hover:text-yellow-800">
                    <Edit2 size={16} />
                </button>
            </td>
        </tr>
    );
};


// --- Komponen Utama: DeviceStatusView ---
export default function DeviceStatusView({ deviceId, onClose, onDeviceUpdated }: DeviceStatusViewProps) {
    const [device, setDevice] = useState<DeviceDetail | null>(null);
    const [ports, setPorts] = useState<PortDetail[]>([]); // State untuk data port
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingDevice, setIsSavingDevice] = useState(false);
    const [isSavingPort, setIsSavingPort] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // 1. Fungsi Fetch Device & Port
    const fetchDeviceDetail = useCallback(async () => {
        if (!deviceId) return;
        setLoading(true);
        setFetchError(null);
        
        try {
            // Fetch Detail Perangkat Utama
            const { data: deviceData, error: deviceError } = await supabase
                .from('network_devices')
                .select('id, name, type, location, ip, ports, usage, status')
                .eq('id', deviceId)
                .single();

            if (deviceError) throw deviceError;

            const detailedDevice: DeviceDetail = {
                ...deviceData,
                uptime_days: 15, uptime_hours: 2, uptime_minutes: 10, 
            };
            setDevice(detailedDevice);

            // Fetch Detail Ports (Simulasi)
            const portData = await fetchDevicePorts(deviceId, detailedDevice.ports);
            setPorts(portData);

        } catch (error: any) {
            console.error("Error fetching device data:", error);
            setFetchError(`Gagal memuat detail: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        fetchDeviceDetail();
    }, [fetchDeviceDetail]);


    // 2. Fungsi Save Edit Device (tabel network_devices)
    const handleSaveDevice = async (updates: Partial<DeviceDetail>) => {
        if (!deviceId) return;
        setIsSavingDevice(true);
        
        const updatesToSave = {
            name: updates.name, ip: updates.ip, location: updates.location,
            type: updates.type, ports: updates.ports, status: updates.status,
        };

        const { error } = await supabase
            .from('network_devices')
            .update(updatesToSave)
            .eq('id', deviceId);

        if (error) {
            alert(`Gagal menyimpan perubahan perangkat: ${error.message}`);
            setIsSavingDevice(false);
            return;
        }

        // Update state lokal dan trigger refresh
        setDevice(prev => ({ ...prev!, ...updatesToSave as Partial<DeviceDetail> }));
        setIsEditing(false);
        setIsSavingDevice(false);
        onDeviceUpdated(); 
        
        // Jika jumlah ports berubah, refresh data port
        if (updates.ports !== device?.ports) {
            fetchDeviceDetail();
        }
    };
    
    // 3. Fungsi Save Edit Port (tabel device_ports - Simulasi)
    const handleSavePort = async (updatedPort: PortDetail) => {
        setIsSavingPort(true);
        try {
            // Gunakan fungsi simulasi update ke DB
            const savedPort = await updatePortDetail(updatedPort);
            
            // Update state ports lokal
            setPorts(prevPorts => 
                prevPorts.map(p => p.id === savedPort.id ? savedPort : p)
            );
        } catch (error: any) {
             alert(`Gagal menyimpan port: ${error.message}`);
        } finally {
            setIsSavingPort(false);
        }
    };


    // --- Perhitungan Summary ---
    const summary = useMemo(() => {
        const totalPorts = device?.ports || 0;
        const activePorts = ports.filter(p => p.status === 'ACTIVE').length;
        const idlePorts = ports.filter(p => p.status === 'IDLE').length;
        const faultyPorts = ports.filter(p => p.status === 'FAULTY').length;
        const availablePorts = totalPorts - activePorts; // Total port fisik dikurangi yang aktif
        const activePercentage = totalPorts > 0 ? (activePorts / totalPorts) * 100 : 0;
        
        return { totalPorts, activePorts, idlePorts, faultyPorts, availablePorts, activePercentage };
    }, [device, ports]);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500 bg-white rounded-xl shadow-lg m-8">
                <Loader2 className="animate-spin mr-2" size={20} /> Memuat detail perangkat dan port...
            </div>
        );
    }

    if (fetchError || !device) {
        return (
            <div className="text-center p-8 text-red-600 bg-red-50 border border-red-200 rounded-xl shadow-lg m-8">
                {fetchError || "Detail perangkat tidak ditemukan."}
                <button onClick={onClose} className="mt-4 block mx-auto text-blue-600 hover:text-blue-800">Kembali ke Daftar</button>
            </div>
        );
    }


    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onClose} className="flex items-center text-gray-600 hover:text-gray-800 transition">
                    <ArrowLeft size={20} className="mr-2" /> Back to Network Overview
                </button>
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                    <Edit2 size={16} className="mr-1" /> Modifikasi Perangkat
                </button>
            </div>

            {/* Ringkasan Status Utama */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{device.name}</h1>
                        <p className="text-gray-500 flex items-center mt-1">
                            <MapPin size={16} className="mr-1" /> {device.location}
                            <span className="mx-2 text-gray-300">•</span>
                            <Tag size={16} className="mr-1" /> {device.type}
                            <span className="mx-2 text-gray-300">•</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${device.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {device.status}
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-mono text-blue-600">{device.ip}</p>
                        <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                            <Clock size={16} className="mr-1" /> Uptime: {device.uptime_days}d {device.uptime_hours}h {device.uptime_minutes}m
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Form Edit Device */}
            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <EditDeviceForm 
                        device={device} 
                        onSave={handleSaveDevice} 
                        onCancel={() => setIsEditing(false)} 
                        isSaving={isSavingDevice}
                    />
                </div>
            )}
            

            {/* Port Allocation dan Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Port Allocation (Chart Simulasi) */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800">Port Allocation</h3>
                    <div className="flex flex-col items-center justify-center">
                        {/* Donut Chart */}
                        <svg width="200" height="200" viewBox="0 0 40 40" className="donut">
                            <circle cx="20" cy="20" r="15.91549430918954" fill="#E5E7EB" stroke="#E5E7EB" strokeWidth="8"></circle>
                            <circle 
                                cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#10B981" strokeWidth="8" 
                                strokeDasharray={`${summary.activePercentage} ${100 - summary.activePercentage}`} strokeDashoffset="25"
                            ></circle>
                            <circle 
                                cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#EF4444" strokeWidth="8" 
                                strokeDasharray={`${100 - summary.activePercentage} ${summary.activePercentage}`} strokeDashoffset={`${25 + summary.activePercentage}`}
                            ></circle>
                            <g className="chart-text text-center" transform="translate(20, 20)">
                                <text className="text-xl font-bold text-gray-800" y="0" x="0" textAnchor="middle">
                                    {summary.totalPorts}
                                </text>
                                <text className="text-xs text-gray-500" y="8" x="0" textAnchor="middle">
                                    Total
                                </text>
                            </g>
                        </svg>
                        <div className="mt-4 w-full px-4">
                            <div className="flex justify-between text-sm font-medium text-green-600">
                                <span><CheckCircle size={14} className="inline mr-1"/> Active</span>
                                <span>{summary.activePorts}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-red-600">
                                <span><XCircle size={14} className="inline mr-1"/> Available (Idle)</span>
                                <span>{summary.availablePorts}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-yellow-600 mt-2 border-t pt-2">
                                <span>Faulty / Maint</span>
                                <span>{summary.faultyPorts}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Port List Summary (Dapat Diedit) */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800">Port List Management</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device/Desc</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Assigned</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VLAN</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ports.map((port) => (
                                    <EditablePortRow 
                                        key={port.id} 
                                        port={port} 
                                        onUpdate={handleSavePort} 
                                        isSaving={isSavingPort}
                                    />
                                ))}
                                {ports.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-4 text-gray-500 text-sm">
                                            Tidak ada port terdaftar untuk perangkat ini. Periksa Total Ports.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
