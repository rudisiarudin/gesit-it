'use client';

import { 
  ArrowLeft, 
  MapPin, 
  Tag, 
  Clock, 
  Edit2, 
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabaseClient"; 

// --- Interfaces Data ---

// Interface dasar perangkat yang akan diambil
interface DeviceDetail {
    id: number;
    name: string;
    type: string;
    location: string;
    ip: string;
    ports: number;
    mac_address?: string;
    status: string; // Active, Maintenance, dll.
    // Tambahkan field yang sesuai dengan tampilan detail Anda
    uptime_days: number;
    uptime_hours: number;
    uptime_minutes: number;
}

// Interface untuk data port (simulasi, seharusnya dari tabel terpisah)
interface PortSummary {
    port: string;
    status: 'ACTIVE' | 'IDLE';
    device: string; // Deskripsi yang terhubung
    vlan: string | number;
    type: string; // Uplink, User, dll.
}

interface DeviceStatusViewProps {
    deviceId: number | null;
    onClose: () => void;
    onDeviceUpdated: () => void; // Callback untuk refresh list jika ada update
}

// --- Data Simulasi Port (untuk tampilan) ---
const mockPortData: PortSummary[] = [
    { port: 'ETH 1', status: 'IDLE', device: 'Unknown', vlan: '-', type: 'Unknown' },
    { port: 'ETH 2', status: 'ACTIVE', device: 'CBN ISP', vlan: '-', type: 'Router' },
    { port: 'ETH 3', status: 'ACTIVE', device: 'LAN Distribution', vlan: 10, type: 'Uplink' },
    { port: 'ETH 4', status: 'ACTIVE', device: 'LAN Office', vlan: 20, type: 'Uplink' },
    { port: 'ETH 5', status: 'IDLE', device: 'Unknown', vlan: '-', type: 'Unknown' },
];


// --- Sub Komponen: Form Edit ---
interface EditFormProps {
    device: DeviceDetail;
    onSave: (updates: Partial<DeviceDetail>) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}

const EditDeviceForm: React.FC<EditFormProps> = ({ device, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState<Partial<DeviceDetail>>(device);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold mb-4">Edit Perangkat</h4>
            <div className="grid grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-gray-700 text-sm">Nama Perangkat</span>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Alamat IP</span>
                    <input type="text" name="ip" value={formData.ip} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Lokasi</span>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                </label>
                <label className="block">
                    <span className="text-gray-700 text-sm">Status</span>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                        <option>Active</option>
                        <option>Maintenance</option>
                        <option>Pending</option>
                    </select>
                </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-100">
                    Batal
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {isSaving ? <Loader2 size={16} className="animate-spin mr-1 inline-block" /> : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    );
};


// --- Komponen Utama: DeviceStatusView ---
export default function DeviceStatusView({ deviceId, onClose, onDeviceUpdated }: DeviceStatusViewProps) {
    const [device, setDevice] = useState<DeviceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fungsi fetch data detail
    const fetchDeviceDetail = useCallback(async () => {
        if (!deviceId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('network_devices')
            .select('*')
            .eq('id', deviceId)
            .single();

        if (error) {
            console.error("Error fetching device detail:", error);
            setLoading(false);
            return;
        }

        // Asumsi data dilengkapi field uptime (jika tidak ada di DB, gunakan mock)
        const detailedData: DeviceDetail = {
            ...data,
            uptime_days: 15, // Mock
            uptime_hours: 2, // Mock
            uptime_minutes: 10, // Mock
        };
        setDevice(detailedData);
        setLoading(false);
    }, [deviceId]);

    useEffect(() => {
        fetchDeviceDetail();
    }, [fetchDeviceDetail]);

    // Fungsi Save Edit
    const handleSave = async (updates: Partial<DeviceDetail>) => {
        if (!deviceId) return;
        setIsSaving(true);
        
        // Hapus field yang tidak boleh di-update di DB (misalnya, field mock)
        const { uptime_days, uptime_hours, uptime_minutes, ...updatesToSave } = updates;

        const { error } = await supabase
            .from('network_devices')
            .update(updatesToSave)
            .eq('id', deviceId);

        if (error) {
            console.error("Error updating device:", error);
            setIsSaving(false);
            alert(`Gagal menyimpan: ${error.message}`);
            return;
        }

        // Update state lokal dan notifikasi
        setDevice(prev => ({ ...prev!, ...updatesToSave }));
        setIsEditing(false);
        setIsSaving(false);
        onDeviceUpdated(); // Trigger refresh di NetworkDeviceList
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                <Loader2 className="animate-spin mr-2" size={20} /> Memuat detail perangkat...
            </div>
        );
    }

    if (!device) {
        return (
            <div className="text-center p-8 text-red-500">
                Detail perangkat tidak ditemukan.
                <button onClick={onClose} className="mt-4 block mx-auto text-blue-600 hover:text-blue-800">Kembali</button>
            </div>
        );
    }
    
    // Hitung status port
    const activePorts = mockPortData.filter(p => p.status === 'ACTIVE').length;
    const idlePorts = mockPortData.filter(p => p.status === 'IDLE').length;
    const totalPorts = activePorts + idlePorts;
    const activePercentage = totalPorts > 0 ? (activePorts / totalPorts) * 100 : 0;
    
    // Port visualizer simulation (Hanya untuk tampilan)
    const portGroups = [
      { start: 1, end: 5, label: 'ETH 1-5' },
      { start: 6, end: 10, label: 'ETH 6-10' },
      { start: 11, end: 13, label: 'ETH 11-13' },
    ];
    
    const getPortStatus = (index: number) => {
        // Mocking status based on index (index 1 to 13)
        const mockStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'IDLE', 'IDLE', 'ACTIVE', 'IDLE', 'ACTIVE', 'IDLE', 'IDLE', 'ACTIVE', 'IDLE'];
        return mockStatuses[index - 1] === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500';
    };


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
            
            {/* Form Edit */}
            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <EditDeviceForm 
                        device={device} 
                        onSave={handleSave} 
                        onCancel={() => setIsEditing(false)} 
                        isSaving={isSaving}
                    />
                </div>
            )}
            

            {/* Physical Status (Visualizer) */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Physical Status</h3>
                
                {/* Port Legend */}
                <div className="flex text-sm mb-4">
                    <span className="flex items-center mr-4">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Active / In-Use
                    </span>
                    <span className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span> Idle / Free
                    </span>
                </div>
                
                {/* Visualizer Area */}
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-300 relative">
                    <div className="text-xs text-gray-500 mb-2">
                        {device.name} (Simulated 13 Ports)
                    </div>
                    <div className="flex justify-between">
                        {portGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="flex flex-col items-center">
                                <div className="text-xs text-gray-700 mb-2">{group.label}</div>
                                <div className="flex gap-1">
                                    {Array.from({ length: group.end - group.start + 1 }).map((_, i) => {
                                        const portIndex = group.start + i;
                                        return (
                                            <div 
                                                key={portIndex}
                                                className={`w-4 h-4 rounded-sm border border-gray-400 ${getPortStatus(portIndex)}`}
                                                title={`Port ${portIndex}: ${getPortStatus(portIndex).includes('green') ? 'Active' : 'Idle'}`}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Port {group.start} - {group.end}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Port Allocation dan Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Port Allocation (Chart Simulasi) */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-1">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800">Port Allocation</h3>
                    <div className="flex flex-col items-center justify-center">
                        <svg width="200" height="200" viewBox="0 0 40 40" className="donut">
                            {/* Background Circle */}
                            <circle cx="20" cy="20" r="15.91549430918954" fill="#E5E7EB" stroke="#E5E7EB" strokeWidth="8"></circle>
                            {/* Active Segment (Green) */}
                            <circle 
                                cx="20" 
                                cy="20" 
                                r="15.91549430918954" 
                                fill="transparent" 
                                stroke="#10B981" 
                                strokeWidth="8" 
                                strokeDasharray={`${activePercentage} ${100 - activePercentage}`} 
                                strokeDashoffset="25"
                            ></circle>
                            {/* Idle Segment (Red) */}
                            <circle 
                                cx="20" 
                                cy="20" 
                                r="15.91549430918954" 
                                fill="transparent" 
                                stroke="#EF4444" 
                                strokeWidth="8" 
                                strokeDasharray={`${100 - activePercentage} ${activePercentage}`} 
                                strokeDashoffset={`${25 + activePercentage}`}
                            ></circle>
                            <g className="chart-text text-center" transform="translate(20, 20)">
                                <text className="text-xl font-bold text-gray-800" y="0" x="0" textAnchor="middle">
                                    {totalPorts}
                                </text>
                                <text className="text-xs text-gray-500" y="8" x="0" textAnchor="middle">
                                    Total
                                </text>
                            </g>
                        </svg>
                        <div className="mt-4 text-center">
                            <span className="text-sm font-medium block text-green-600">Active: {activePorts}</span>
                            <span className="text-sm font-medium block text-red-600">Idle: {idlePorts}</span>
                        </div>
                    </div>
                </div>

                {/* Port List Summary */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                    <h3 className="text-xl font-semibold mb-4 text-slate-800">Port List Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VLAN</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockPortData.map((port, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{port.port}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${port.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {port.status.charAt(0) + port.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{port.device}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{port.vlan}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{port.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
