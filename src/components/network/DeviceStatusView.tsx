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
// (Fungsi ini mensimulasikan pengambilan dan penyimpanan data dari tabel 'device_ports')

async function fetchDevicePorts(deviceId: number, totalPorts: number): Promise<PortDetail[]> {
    const ports: PortDetail[] = [];
    for (let i = 1; i <= totalPorts; i++) {
        let status: 'ACTIVE' | 'IDLE' | 'FAULTY' = 'IDLE';
        let connected_device = '-';
        let ip_assigned = '';
        let vlan = 1;
        let port_type = 'USER';

        if (i === 1) { 
            status = 'ACTIVE';
            connected_device = 'WAN/ISP';
            vlan = 0;
            port_type = 'WAN';
        } else if (i === 2) { 
            status = 'ACTIVE';
            connected_device = 'Distribution Switch F1';
            ip_assigned = '192.168.1.10';
            vlan = 10;
            port_type = 'UPLINK';
        } else if (i === 5) { 
            status = 'ACTIVE';
            connected_device = 'PC User A05';
            ip_assigned = '192.168.10.50';
            vlan = 20;
            port_type = 'PoE';
        } else if (i === 28) { // Simulasi Port Faulty
            status = 'FAULTY';
            connected_device = 'Cabling Issue';
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
    await new Promise(resolve => setTimeout(resolve, 300)); 
    return ports;
}

async function updatePortDetail(portData: PortDetail): Promise<PortDetail> {
    console.log(`[DB Sim] Updating Port ${portData.port_number} on Device ${portData.device_id}`, portData);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // Di dunia nyata, ini akan memanggil supabase.from('device_ports').update(...)
    return portData;
}


// --- Sub Komponen: Form Edit Device ---
interface EditFormProps {
    device: DeviceDetail;
    onSave: (updates: Partial<DeviceDetail>) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}

const EditDeviceForm: React.FC<EditFormProps> = ({ device, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState<Partial<DeviceDetail>>({
        name: device.name, ip: device.ip, location: device.location,
        type: device.type, ports: device.ports, status: device.status,
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
            <h4 className="text-lg font-bold mb-4 text-slate-800">Edit Detail Perangkat Utama</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Nama Perangkat</span>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-inner p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </label>
                
                <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Alamat IP</span>
                    <input type="text" name="ip" value={formData.ip || ''} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-gray-300 shadow-inner p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </label>
                
                <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Lokasi (Ruangan)</span>
                    <input type="text" name="location" value={formData.location || ''} onChange={handleChange} required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-inner p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </label>
                
                <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Total Ports</span>
                    <input type="number" name="ports" value={formData.ports || 0} onChange={handleChange} min="0" required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-inner p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </label>
                
                <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Tipe</span>
                    <select name="type" value={formData.type || ''} onChange={handleChange} required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-inner p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option>Router/Switch</option>
                        <option>Access Switch</option>
                        <option>Patch Panel</option>
                        <option>Media Converter</option>
                        <option>Hub/Repeater</option>
                    </select>
                </label>
                
                <label className="block">
                    <span className="text-gray-700 text-sm font-medium">Status Operasi</span>
                    <select name="status" value={formData.status || ''} onChange={handleChange} required className="mt-1 block w-full rounded-lg border border-gray-300 shadow-inner p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option>Active</option>
                        <option>Maintenance</option>
                        <option>Pending</option>
                        <option>Decommissioned</option>
                    </select>
                </label>
                
            </div>
            <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                    Batal
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition">
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
        'ACTIVE': 'bg-green-500 text-white font-bold',
        'IDLE': 'bg-red-500 text-white font-bold',
        'FAULTY': 'bg-yellow-500 text-gray-800 font-bold',
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
            <tr className="bg-indigo-50/50">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">ETH {port.port_number}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <select name="status" value={tempData.status} onChange={handleChange} className="w-full border border-indigo-300 rounded p-1 text-xs focus:ring-indigo-500">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="IDLE">IDLE</option>
                        <option value="FAULTY">FAULTY</option>
                    </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <input type="text" name="connected_device" value={tempData.connected_device} onChange={handleChange} className="w-full border border-indigo-300 rounded p-1 text-xs focus:ring-indigo-500" placeholder="Perangkat Terhubung" />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <input type="text" name="ip_assigned" value={tempData.ip_assigned} onChange={handleChange} className="w-full border border-indigo-300 rounded p-1 text-xs font-mono" placeholder="IP" />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <input type="number" name="vlan" value={tempData.vlan} onChange={handleChange} className="w-full border border-indigo-300 rounded p-1 text-xs" min="0" />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                    <select name="port_type" value={tempData.port_type} onChange={handleChange} className="w-full border border-indigo-300 rounded p-1 text-xs focus:ring-indigo-500">
                        <option>USER</option>
                        <option>UPLINK</option>
                        <option>WAN</option>
                        <option>PoE</option>
                    </select>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                    <button onClick={handleSave} disabled={isSaving} className="text-green-600 hover:text-green-800 disabled:opacity-50 p-1">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    </button>
                    <button onClick={() => setIsEditMode(false)} className="text-red-500 hover:text-red-700 p-1 ml-1">
                        <XCircle size={16} />
                    </button>
                </td>
            </tr>
        );
    }

    return (
        <tr className="border-b border-gray-100 hover:bg-indigo-50/20 transition">
            <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">ETH {port.port_number}</td>
            <td className="px-3 py-3 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 rounded ${statusColor}`}>
                    {port.status.charAt(0) + port.status.slice(1).toLowerCase()}
                </span>
            </td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{port.connected_device || '-'}</td>
            <td className="px-3 py-3 whitespace-nowrap text-sm font-mono text-blue-600">{port.ip_assigned || '-'}</td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{port.vlan}</td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{port.port_type}</td>
            <td className="px-3 py-3 whitespace-nowrap text-right">
                <button onClick={() => setIsEditMode(true)} className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 transition">
                    <Edit2 size={16} />
                </button>
            </td>
        </tr>
    );
};


// --- Komponen Utama: DeviceStatusView ---
export default function DeviceStatusView({ deviceId, onClose, onDeviceUpdated }: DeviceStatusViewProps) {
    const [device, setDevice] = useState<DeviceDetail | null>(null);
    const [ports, setPorts] = useState<PortDetail[]>([]);
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

            // Fetch Detail Ports (Simulasi, di dunia nyata ambil dari tabel device_ports)
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

        setDevice(prev => ({ ...prev!, ...updatesToSave as Partial<DeviceDetail> }));
        setIsEditing(false);
        setIsSavingDevice(false);
        onDeviceUpdated(); 
        
        if (updates.ports !== device?.ports) {
            fetchDeviceDetail(); // Refresh ports jika jumlah port diubah
        }
    };
    
    // 3. Fungsi Save Edit Port (tabel device_ports - Simulasi)
    const handleSavePort = async (updatedPort: PortDetail) => {
        setIsSavingPort(true);
        try {
            const savedPort = await updatePortDetail(updatedPort);
            
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
        const availablePorts = totalPorts - activePorts; 
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
                <button onClick={onClose} className="flex items-center text-gray-600 hover:text-indigo-800 font-medium transition">
                    <ArrowLeft size={20} className="mr-2" /> Back to Network Overview
                </button>
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition"
                >
                    <Edit2 size={16} className="mr-1" /> Modifikasi Perangkat
                </button>
            </div>

            {/* Ringkasan Status Utama */}
            <div className="bg-white p-6 rounded-xl shadow-2xl mb-6 border-t-4 border-indigo-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">{device.name}</h1>
                        <p className="text-gray-600 flex items-center mt-2 text-sm">
                            <MapPin size={16} className="mr-1 text-indigo-500" /> {device.location}
                            <span className="mx-3 text-gray-300">|</span>
                            <Tag size={16} className="mr-1 text-indigo-500" /> {device.type}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-mono text-indigo-600 font-bold">{device.ip}</p>
                        <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                            <Clock size={16} className="mr-1" /> Uptime: <span className="font-semibold ml-1">{device.uptime_days}d {device.uptime_hours}h {device.uptime_minutes}m</span>
                        </p>
                        <span className={`mt-2 inline-block px-3 py-1 text-xs rounded-full font-bold ${device.status === 'Active' ? 'bg-green-500 text-white shadow-sm' : 'bg-yellow-500 text-gray-800'}`}>
                            {device.status}
                        </span>
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
            
            {/* Physical Status (Visualizer) - Sederhana */}
             <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Physical Status</h3>
                <div className="flex text-sm mb-4">
                    <span className="flex items-center mr-4"><span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Active / In-Use</span>
                    <span className="flex items-center mr-4"><span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> Idle / Free</span>
                     <span className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span> Faulty</span>
                </div>
                
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 relative">
                    <div className="text-xs text-gray-500 mb-2">{device.name} (Total {device.ports} Ports)</div>
                    <div className="flex flex-wrap gap-2">
                        {ports.slice(0, 48).map((port) => {
                            const isRouter = device.type.includes('Router');
                            const Icon = isRouter && port.port_number === 1 ? Server : LinkIcon;
                            const statusClass = {
                                'ACTIVE': 'bg-green-200 border-green-500 text-green-700',
                                'IDLE': 'bg-red-200 border-red-500 text-red-700',
                                'FAULTY': 'bg-yellow-200 border-yellow-500 text-yellow-700',
                            }[port.status];
                            
                            return (
                                <div 
                                    key={port.port_number}
                                    className={`relative p-1 rounded border-2 text-center w-12 ${statusClass}`}
                                    title={`Port ${port.port_number}: ${port.status} - ${port.connected_device}`}
                                >
                                    <Icon size={12} className={`mx-auto`} />
                                    <span className="text-[8px] font-medium">ETH {port.port_number}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Port Allocation dan Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Port Allocation (Chart Simulasi) */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-1 flex flex-col items-center">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 border-b pb-2 w-full text-center">Port Allocation</h3>
                    <svg width="200" height="200" viewBox="0 0 40 40" className="donut">
                        {/* Background Circle */}
                        <circle cx="20" cy="20" r="15.91549430918954" fill="#E5E7EB" stroke="#E5E7EB" strokeWidth="8"></circle>
                        {/* Active Segment (Green) */}
                        <circle 
                            cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#10B981" strokeWidth="8" 
                            strokeDasharray={`${summary.activePercentage} ${100 - summary.activePercentage}`} strokeDashoffset="25"
                        ></circle>
                        {/* Idle/Available Segment (Red) */}
                        <circle 
                            cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#EF4444" strokeWidth="8" 
                            strokeDasharray={`${(summary.idlePorts/summary.totalPorts)*100} ${100 - (summary.idlePorts/summary.totalPorts)*100}`} strokeDashoffset={`${25 + summary.activePercentage}`}
                        ></circle>
                         {/* Faulty Segment (Yellow) */}
                        <circle 
                            cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#F59E0B" strokeWidth="8" 
                            strokeDasharray={`${(summary.faultyPorts/summary.totalPorts)*100} ${100 - (summary.faultyPorts/summary.totalPorts)*100}`} strokeDashoffset={`${25 + summary.activePercentage + (summary.idlePorts/summary.totalPorts)*100}`}
                        ></circle>
                        <g className="chart-text text-center" transform="translate(20, 20)">
                            <text className="text-2xl font-bold text-gray-800" y="0" x="0" textAnchor="middle">{summary.totalPorts}</text>
                            <text className="text-xs text-gray-500" y="9" x="0" textAnchor="middle">Total</text>
                        </g>
                    </svg>
                    <div className="mt-4 w-full px-4 border-t pt-4">
                        <div className="flex justify-between text-sm font-medium text-green-600 py-1">
                            <span><CheckCircle size={14} className="inline mr-1"/> Active</span>
                            <span>{summary.activePorts}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-red-600 py-1">
                            <span><XCircle size={14} className="inline mr-1"/> Available (Idle)</span>
                            <span>{summary.idlePorts}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-yellow-600 py-1">
                            <span>Faulty / Maint</span>
                            <span>{summary.faultyPorts}</span>
                        </div>
                    </div>
                </div>

                {/* Port List Management (Tabel Dapat Diedit) */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800 border-b pb-2">Port List Management</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Port</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Device/Desc</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">IP Assigned</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">VLAN</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
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
                                            Tidak ada port terdaftar untuk perangkat ini.
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
