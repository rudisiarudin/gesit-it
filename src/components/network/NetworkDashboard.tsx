// src/components/network/NetworkDashboard.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Server, Activity, Users, Globe, Filter, List, Network,
  Clock, MapPin, Tag, Edit2, Save, XCircle, Loader2, Link as LinkIcon 
} from 'lucide-react';

// Import komponen internal
import { PortDetailModal } from './PortDetailModal'; // Modal Detail Port
import { NetworkDetail } from './NetworkDetail';       // Overview Statistik Jaringan Global

// Import dari file types dan constants yang Anda miliki
import { 
  NetworkSwitch, 
  SwitchPort, 
  PortStatus 
} from '../../types';
import { MOCK_SWITCHES } from '../../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'; // Diperlukan untuk chart

// --- PLACEHOLDER SUB-KOMPONEN (Gunakan implementasi Anda yang sudah ada) ---

// ⚠️ PLACEHOLDER 1: SwitchVisualizer
const SwitchVisualizer = ({ switchDetails, onPortClick }: { switchDetails: NetworkSwitch, onPortClick: (port: SwitchPort) => void }) => {
    // Implementasi Visualizer Sederhana
    const totalFaulty = switchDetails.ports.filter(p => p.status === PortStatus.FAULTY).length;
    return (
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 relative">
            <div className="text-center text-xs text-gray-600 mb-3">
                {switchDetails.name} | Total Ports: {switchDetails.totalPorts} 
                {totalFaulty > 0 && <span className="text-yellow-700 ml-2">({totalFaulty} Faulty)</span>}
            </div>
            <div className="flex flex-wrap gap-2 justify-start max-h-48 overflow-y-auto p-2">
                {switchDetails.ports.map((port) => {
                    const statusClass = {
                        [PortStatus.ACTIVE]: 'bg-green-500 border-green-700',
                        [PortStatus.IDLE]: 'bg-red-500 border-red-700',
                        [PortStatus.FAULTY]: 'bg-yellow-500 border-yellow-700',
                    }[port.status];
                    return (
                        <div 
                            key={port.id} 
                            className={`w-10 h-10 rounded-sm shadow-sm flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition border ${statusClass}`}
                            onClick={() => onPortClick(port)} // Triggers Port Detail Modal
                            title={`Port ${port.portNumber}: ${port.deviceConnected || 'Free'}`}
                        >
                            {port.portNumber}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ⚠️ PLACEHOLDER 2: TopologyDiagram
const TopologyDiagram = () => (
    <div className="bg-gray-50 p-10 rounded-xl border border-dashed border-gray-300 min-h-[500px] flex items-center justify-center">
        <p className="text-gray-500 text-lg flex items-center gap-2">
            <Network size={20} /> Placeholder untuk Diagram Topologi
        </p>
    </div>
);

// ⚠️ PLACEHOLDER 3: EditablePortRow (Harus diimpor atau dibuat di sini)
interface EditablePortRowProps {
    port: SwitchPort;
    onUpdate: (updatedPort: SwitchPort) => void;
}
const EditablePortRow: React.FC<EditablePortRowProps> = ({ port, onUpdate }) => {
     // Ini adalah placeholder. Gunakan implementasi EditablePortRow dari skrip sebelumnya
     // yang berisi state isEditMode, input, dan tombol Save/Cancel.
     return (
        <tr className="border-b border-gray-100 hover:bg-indigo-50/20 transition cursor-pointer">
            <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">#{port.portNumber}</td>
            <td className="px-3 py-3 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 rounded ${port.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {port.status.charAt(0) + port.status.slice(1).toLowerCase()}
                </span>
            </td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{port.deviceConnected || '-'}</td>
            <td className="px-3 py-3 whitespace-nowrap text-sm font-mono text-blue-600">{port.ipAddress || port.description || '-'}</td>
            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{port.vlan}</td>
            <td className="px-3 py-3 whitespace-nowrap text-right">
                <Edit2 size={16} className="text-indigo-500" title="Click row to edit" />
            </td>
        </tr>
    );
};


// --- Komponen Utama: NetworkDashboard ---

export const NetworkDashboard: React.FC = () => {
  const [switches, setSwitches] = useState<NetworkSwitch[]>(MOCK_SWITCHES);
  const [selectedSwitchId, setSelectedSwitchId] = useState<string | null>(null);
  const [selectedPort, setSelectedPort] = useState<SwitchPort | null>(null); 
  const [viewMode, setViewMode] = useState<'list' | 'topology'>('list');

  const activeSwitch = useMemo(() => 
    switches.find(s => s.id === selectedSwitchId), 
  [selectedSwitchId, switches]);

  // Pie Chart Data untuk switch yang aktif
  const portData = useMemo(() => {
    if (!activeSwitch) return [];
    const active = activeSwitch.ports.filter(p => p.status === PortStatus.ACTIVE).length;
    const idle = activeSwitch.ports.filter(p => p.status === PortStatus.IDLE).length;
    const faulty = activeSwitch.ports.filter(p => p.status === PortStatus.FAULTY).length;

    return [
        { name: 'Active', value: active, color: '#22c55e' }, 
        { name: 'Idle', value: idle, color: '#ef4444' }, 
        { name: 'Faulty', value: faulty, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  }, [activeSwitch]);

  // Handler untuk mengupdate port pada state lokal (Mock DB Update)
  const handleUpdatePort = useCallback((updatedPort: SwitchPort) => {
    setSwitches(prevSwitches => prevSwitches.map(sw => {
      if (sw.id === selectedSwitchId) {
        return {
          ...sw,
          ports: sw.ports.map(p => 
            p.id === updatedPort.id ? updatedPort : p
          ),
        };
      }
      return sw;
    }));
  }, [selectedSwitchId]);


  if (selectedSwitchId && activeSwitch) {
    // === 2. DETAILED SWITCH VIEW ===
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-gray-50 min-h-screen">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
            <button 
                onClick={() => setSelectedSwitchId(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-800 font-medium transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Network Overview</span>
            </button>
        </div>

        {/* Switch Header Card */}
        <div className="bg-white rounded-xl p-6 shadow-2xl border-t-4 border-indigo-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-extrabold text-slate-800">{activeSwitch.name}</h2>
                {/* ... Detail Switch (IP, Lokasi, Model, Status) ... */}
            </div>
        </div>
        
        {/* Konten Detail: Visualizer dan Port List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Visualizer & Allocation */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Physical Status</h3>
                    <SwitchVisualizer 
                        switchDetails={activeSwitch} 
                        onPortClick={setSelectedPort} // Set selectedPort untuk Modal
                    />
                </div>
                
                {/* Port Allocation Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4 border-b pb-2">Port Allocation</h4>
                    {/* ... Implementasi Pie Chart menggunakan portData ... */}
                </div>
            </div>

            {/* Port List Management (Tabel Dapat Diedit) */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Port Management & Documentation</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... Table Header ... */}
                        <tbody className="bg-white divide-y divide-gray-100">
                            {activeSwitch.ports.map((port) => (
                                <EditablePortRow 
                                    key={port.id} 
                                    port={port} 
                                    onUpdate={handleUpdatePort} 
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Modal Port Detail */}
        <PortDetailModal 
            port={selectedPort} 
            switchName={activeSwitch.name}
            onClose={() => setSelectedPort(null)} 
        />
      </div>
    );
  }

  // === 1. MAIN NETWORK OVERVIEW (LIST/TOPOLOGY) ===
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        
      {/* Network Detail: Statistik Jaringan Global */}
      <NetworkDetail />

      {/* List of Switches / Topology Toggle */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            {/* ... Tombol Toggle View ... */}
        </div>
        
        {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {switches.map(sw => (
                    <div 
                        key={sw.id} 
                        onClick={() => setSelectedSwitchId(sw.id)}
                        className="... card styling for switch list ..."
                    >
                        {/* ... Tampilan Card Switch ... */}
                        <span className="text-xs font-medium text-indigo-600 group-hover:underline">View Status &rarr;</span>
                    </div>
                ))}
              </div>
        ) : (
            <div className="p-6">
                <TopologyDiagram />
            </div>
        )}
      </div>
    </div>
  );
};
