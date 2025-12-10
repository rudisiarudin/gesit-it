// src/components/PortDetailModal.tsx

import React from 'react';
import { X, Wifi, Globe, Server, Activity, Tag, Cpu, Clipboard, MapPin } from 'lucide-react';
import { SwitchPort, PortStatus } from '../types'; // Import dari types.ts

interface PortDetailModalProps {
    port: SwitchPort | null;
    switchName: string;
    onClose: () => void;
}

export const PortDetailModal: React.FC<PortDetailModalProps> = ({ port, switchName, onClose }) => {
    if (!port) return null;

    // Menentukan style berdasarkan status port
    const statusColor = {
        [PortStatus.ACTIVE]: 'bg-green-500 text-white',
        [PortStatus.IDLE]: 'bg-red-500 text-white',
        [PortStatus.FAULTY]: 'bg-yellow-500 text-gray-800',
    }[port.status];

    const StatusIcon = port.status === PortStatus.ACTIVE ? Activity : X;
    const isConnected = !!port.deviceConnected;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all scale-100 ease-out duration-300">
                
                {/* Header Modal */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <LinkIcon size={20} className="text-indigo-600"/> Port #{port.portNumber} Detail
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Body Modal - Informasi Utama */}
                <div className="p-6 space-y-5">
                    
                    {/* Status Card */}
                    <div className="flex items-center justify-between p-4 rounded-lg shadow-sm border" style={{ backgroundColor: `${statusColor.replace('500', '100')}` }}>
                        <div className="flex items-center gap-3">
                            <StatusIcon size={24} className={statusColor.split(' ')[0].replace('bg', 'text')} />
                            <p className={`text-lg font-bold ${statusColor.split(' ')[0].replace('bg', 'text')}`}>
                                {port.status.charAt(0) + port.status.slice(1).toLowerCase()}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-gray-600">On Device</p>
                             <p className="font-semibold text-gray-900">{switchName}</p>
                        </div>
                    </div>

                    {/* Detail Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <DetailItem icon={Globe} label="IP Address" value={port.ipAddress || "N/A"} color="text-blue-600" />
                        <DetailItem icon={Cpu} label="Port Type" value={port.deviceType} color="text-yellow-600" />
                        <DetailItem icon={Tag} label="VLAN ID" value={port.vlan.toString()} color="text-indigo-600" />
                        <DetailItem icon={Server} label="Connected To" value={port.deviceConnected || "None"} color={isConnected ? "text-green-600" : "text-red-600"} />
                    </div>

                    {/* Deskripsi */}
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                            <Clipboard size={18} className="text-gray-500" /> Deskripsi / Keterangan
                        </h4>
                        <p className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 italic">
                            {port.description || "Tidak ada deskripsi rinci. Port ini mungkin dikelola secara otomatis."}
                        </p>
                    </div>

                </div>

                {/* Footer Modal */}
                <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-komponen untuk item detail
const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <Icon size={18} className={color} />
        <div>
            <p className="text-gray-500 text-xs uppercase">{label}</p>
            <p className="font-semibold text-gray-800 break-words">{value}</p>
        </div>
    </div>
);
