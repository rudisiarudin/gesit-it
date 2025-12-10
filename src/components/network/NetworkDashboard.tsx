// src/components/network/NetworkDashboard.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, Server, Activity, Router, MapPin, Edit2, Save, XCircle, 
  List, Network, Clock, Tag, Globe, Settings, TrendingUp, Loader2,
  AlertTriangle, CheckCircle, Wifi
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Menggunakan Path Alias yang telah dikonfirmasi berfungsi
import { PortDetailModal } from './PortDetailModal';
import { NetworkDetail } from './NetworkDetail';
import { 
  NetworkSwitch, 
  SwitchPort, 
  PortStatus 
} from '@/types'; // DIGANTI DARI '../../types'
import { MOCK_SWITCHES } from '@/constants'; // DIGANTI DARI '../../constants'

// --- KODE SUB-KOMPONEN UNTUK KELENGKAPAN (Simplified/Placeholder) ---

// Placeholder: Status Visualizer Port
const SwitchVisualizer = ({ switchDetails, onPortClick }: { switchDetails: NetworkSwitch, onPortClick: (port: SwitchPort) => void }) => {
    const totalFaulty = switchDetails.ports.filter(p => p.status === PortStatus.FAULTY).length;
    return (
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 relative">
            <div className="text-center text-xs text-gray-600 mb-3 font-mono">
                {switchDetails.model} | Total Ports: {switchDetails.totalPorts} 
                {totalFaulty > 0 && <span className="text-yellow-700 ml-2 font-semibold">({totalFaulty} Faulty)</span>}
            </div>
            <div className="flex flex-wrap gap-1 justify-start max-h-48 overflow-y-auto p-2 border border-dashed border-gray-400">
                {switchDetails.ports.map((port) => {
                    const statusClass = {
                        [PortStatus.ACTIVE]: 'bg-green-500 border-green-700 hover:bg-green-400',
                        [PortStatus.IDLE]: 'bg-red-500 border-red-700 hover:bg-red-400',
                        [PortStatus.FAULTY]: 'bg-yellow-500 border-yellow-700 hover:bg-yellow-400',
                    }[port.status];
                    return (
                        <div 
                            key={port.id} 
                            className={`w-7 h-7 rounded-sm shadow-sm flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition border ${statusClass}`}
                            onClick={() => onPortClick(port)}
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

// Placeholder: Topology Diagram
const TopologyDiagram = () => (
    <div className="bg-white p-10 rounded-xl border border-dashed border-indigo-300 min-h-[500px] flex items-center justify-center">
        <p className="text-gray-500 text-lg flex items-center gap-2">
            <Network size={20} className="text-indigo-500" /> Diagram Topologi Jaringan (Implementasi D3.js/ReactFlow)
        </p>
    </div>
);

// Placeholder: Editable Port Row
const EditablePortRow: React.FC<{ port: SwitchPort; onUpdate: (p: SwitchPort) => void }> = ({ port, onUpdate }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [draftPort, setDraftPort] = useState(port);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            onUpdate(draftPort);
            setIsEditMode(false);
            setIsLoading(false);
        }, 500);
    };

    const handleCancel = () => {
        setDraftPort(port); // Reset ke nilai asli
        setIsEditMode(false);
    };

    const statusClass = {
        [PortStatus.ACTIVE]: 'bg-green-100 text-green-800',
        [PortStatus.IDLE]: 'bg-red-100 text-red-800',
        [PortStatus.FAULTY]: 'bg-yellow-100 text-yellow-800',
    }[port.status];

    if (isEditMode) {
        return (
            <tr className="bg-indigo-50/50 border-b border-indigo-200">
                <td className="px-3 py-2 text-sm font-semibold text-gray-900">#{port.portNumber}</td>
                <td>
                    <select 
                        value={draftPort.status} 
                        onChange={(e) => setDraftPort({...draftPort, status: e.target.value as PortStatus})}
                        className="p-1 border rounded text-xs"
                    >
                        {Object.values(PortStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </td>
                <td><input type="text" value={draftPort.deviceConnected || ''} onChange={(e) => setDraftPort({...draftPort, deviceConnected: e.target.value || null})} className="p-1 border rounded w-full text-xs" /></td>
                <td><input type="text" value={draftPort.ipAddress || ''} onChange={(e) => setDraftPort({...draftPort, ipAddress: e.target.value || null})} className="p-1 border rounded w-full text-xs font-mono" /></td>
                <td><input type="number" value={draftPort.vlan} onChange={(e) => setDraftPort({...draftPort, vlan: parseInt(e.target.value)})} className="p-1 border rounded w-16 text-xs" /></td>
                <td>
                    <input type="text" value={draftPort.description || ''} onChange={(e) => setDraftPort({...draftPort, description: e.target.value})} className="p-1 border rounded w-full text-xs" />
                </td>
                <td className="px-3 py-2 text-right flex gap-1 justify-end">
                    <button onClick={handleSave} disabled={isLoading} className="text-green-600 hover:text-green-800 disabled:opacity-50"><Save size={16} /></button>
                    <button onClick={handleCancel} disabled={isLoading} className="text-red-600 hover:text-red-800 disabled:opacity-50"><XCircle size={16} /></button>
                </td>
            </tr>
        );
    }

    return (
        <tr 
            className="hover:bg-gray-50/70 transition cursor-pointer"
            onClick={() => setIsEditMode(true)} // Klik row untuk edit
        >
            <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">#{port.portNumber}</td>
            <td className="px-3 py-2 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 rounded-full ${statusClass}`}>
                    {port.status.charAt(0) + port.status.slice(1).toLowerCase()}
                </span>
            </td>
            <td className="px-3 py-2 text-sm text-gray-700">{port.deviceConnected || '-'}</td>
            <td className="px-3 py-2 text-sm font-mono text-blue-600">{port.ipAddress || '-'}</td>
            <td className="px-3 py-2 text-sm text-gray-600 font-medium">{port.vlan}</td>
            <td className="px-3 py-2 text-sm text-gray-500 truncate max-w-xs">{port.description || '-'}</td>
            <td className="px-3 py-2 text-right"><Edit2 size={16} className="text-indigo-500/70" /></td>
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

  // Pie Chart Data
  const portData = useMemo(() => {
    if (!activeSwitch) return [];
    const active = activeSwitch.ports.filter(p => p.status === PortStatus.ACTIVE).length;
    const idle = activeSwitch.ports.filter(p => p.status === PortStatus.IDLE).length;
    const faulty = activeSwitch.ports.filter(p => p.status === PortStatus.FAULTY).length;
    const total = active + idle + faulty;

    return [
        { name: 'Active', value: active, color: '#22c55e' }, 
        { name: 'Idle', value: idle + faulty, color: '#ef4444' }, // Gabungkan Idle dan Faulty untuk pie sederhana
    ].filter(d => d.value > 0);
  }, [activeSwitch]);

  const totalPortsActiveSwitch = activeSwitch ? activeSwitch.totalPorts : 0;

  // Handler untuk mengupdate port pada state lokal
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


  // === 2. DETAILED SWITCH VIEW ===
  if (selectedSwitchId && activeSwitch) {
    const isOffline = activeSwitch.status === 'Offline';
    const totalFaulty = activeSwitch.ports.filter(p => p.status === PortStatus.FAULTY).length;
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 bg-gray-50 min-h-screen">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
            <button 
                onClick={() => setSelectedSwitchId(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-800 font-medium transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Network Overview</span>
            </button>
            <button 
                onClick={() => alert("Navigate to Topology View for this switch")}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors border border-indigo-600 px-3 py-1 rounded-lg"
            >
                <Network size={18} /> View in Topology
            </button>
        </div>

        {/* Switch Header Card */}
        <div className={`bg-white rounded-xl p-6 shadow-2xl border-t-4 ${isOffline ? 'border-red-600' : 'border-indigo-600'}`}>
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">{activeSwitch.name}</h2>
                    <div className="flex items-center text-sm mt-1 text-gray-600 gap-4">
                        <span className="flex items-center gap-1"><MapPin size={16} className="text-red-500"/> {activeSwitch.location}</span>
                        <span className="flex items-center gap-1"><Router size={16} className="text-gray-500"/> {activeSwitch.model}</span>
                        <span className="flex items-center gap-1"><Tag size={16} className="text-gray-500"/> {activeSwitch.totalPorts} Ports</span>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-lg font-bold text-indigo-600">{activeSwitch.ip}</p>
                    <p className={`text-sm font-semibold flex items-center gap-1 justify-end ${isOffline ? 'text-red-600' : 'text-green-600'}`}>
                        {isOffline ? <AlertTriangle size={16}/> : <Clock size={16}/>}
                        {isOffline ? 'Offline' : `Uptime: ${activeSwitch.uptime}`}
                    </p>
                </div>
            </div>
        </div>
        
        {/* Konten Detail: Visualizer dan Port List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Visualizer & Allocation */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-2"><Settings size={20}/> Physical Status</h3>
                    
                    {isOffline ? (
                        <div className="text-center py-10 text-red-500 font-semibold">
                            <AlertTriangle size={36} className="mx-auto mb-3"/> Device Offline. Cannot render port status.
                        </div>
                    ) : (
                        <SwitchVisualizer 
                            switchDetails={activeSwitch} 
                            onPortClick={setSelectedPort}
                        />
                    )}
                    
                </div>
                
                {/* Port Allocation Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><Wifi size={20}/> Port Allocation ({totalPortsActiveSwitch} Total)</h4>
                    
                    <div className="h-64 flex justify-center items-center relative">
                        {portData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={portData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        fill="#8884d8"
                                        labelLine={false}
                                    >
                                        {portData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number) => `${value} Ports`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500">No port data available.</p>
                        )}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-3xl font-bold text-slate-800">{totalPortsActiveSwitch}</span>
                            <span className="block text-xs text-gray-500">TOTAL</span>
                        </div>
                    </div>

                    <div className="text-sm mt-4 pt-4 border-t border-gray-100">
                        <p className={`font-semibold ${totalFaulty > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {totalFaulty} Faulty / Maintenance
                        </p>
                    </div>
                </div>
            </div>

            {/* Port List Management (Tabel Dapat Diedit) */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2"><List size={20}/> Port Management & Documentation</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Port</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Device Connected</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP Address</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">VLAN</th>
                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
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
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Server size={22} className="text-indigo-600"/> Network Devices ({switches.length} Total)
            </h3>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <List size={16} className="inline mr-1"/> List View
                </button>
                <button 
                    onClick={() => setViewMode('topology')} 
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${viewMode === 'topology' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <Network size={16} className="inline mr-1"/> Topology View
                </button>
            </div>
        </div>
        
        {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {switches.map(sw => {
                    const activePorts = sw.ports.filter(p => p.status === PortStatus.ACTIVE).length;
                    const usage = sw.totalPorts > 0 ? ((activePorts / sw.totalPorts) * 100).toFixed(0) : '0';
                    const isOffline = sw.status === 'Offline';
                    
                    return (
                        <div 
                            key={sw.id} 
                            onClick={() => setSelectedSwitchId(sw.id)}
                            className={`group bg-white rounded-xl p-5 shadow-sm border ${isOffline ? 'border-red-400 opacity-70' : 'border-gray-200 hover:border-indigo-400'} cursor-pointer transition transform hover:scale-[1.02]`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className={`text-lg font-bold ${isOffline ? 'text-red-700' : 'text-slate-800'}`}>{sw.name}</h4>
                                <Router size={24} className={`flex-shrink-0 ${isOffline ? 'text-red-500' : 'text-indigo-500'}`} />
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {sw.location}</p>
                            
                            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-gray-600">Ports Usage</p>
                                    <p className="text-xl font-bold text-indigo-600">{usage}%</p>
                                    <p className="text-xs text-gray-400">{activePorts} / {sw.totalPorts} Ports</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono text-gray-500">{sw.ip}</p>
                                    <span className="text-sm font-medium text-indigo-600 group-hover:underline mt-1 block">
                                        {isOffline ? 'View Details' : 'View Status'} &rarr;
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
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
