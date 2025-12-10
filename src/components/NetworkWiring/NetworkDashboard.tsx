'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Server, Activity, Users, Globe, Filter, List, Network, Cable } from 'lucide-react';
import { NetworkSwitch, SwitchPort, PortStatus, DashboardStat } from '../types';
import { SwitchVisualizer } from './SwitchVisualizer';
import { PortDetailModal } from './PortDetailModal';
import { TopologyDiagram } from './TopologyDiagram';
import { WiringSchedule } from './WiringSchedule';
import { MOCK_SWITCHES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface NetworkDashboardProps {
  onBack: () => void;
}

export const NetworkDashboard: React.FC<NetworkDashboardProps> = ({ onBack }) => {
  const [selectedSwitchId, setSelectedSwitchId] = useState<string | null>(null);
  const [selectedPort, setSelectedPort] = useState<SwitchPort | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'topology' | 'wiring'>('list');

  // Derived state
  const activeSwitch = useMemo(() => 
    MOCK_SWITCHES.find(s => s.id === selectedSwitchId), 
  [selectedSwitchId]);

  const stats = useMemo(() => {
    const totalSwitches = MOCK_SWITCHES.length;
    let totalPorts = 0;
    let activePorts = 0;
    
    MOCK_SWITCHES.forEach(sw => {
        totalPorts += sw.ports.length;
        activePorts += sw.ports.filter(p => p.status === PortStatus.ACTIVE).length;
    });

    return [
        { label: 'Total Switches', value: totalSwitches, icon: Server, colorClass: 'bg-blue-100 text-blue-600' },
        { label: 'Total Ports', value: totalPorts, icon: Globe, colorClass: 'bg-indigo-100 text-indigo-600' },
        { label: 'Active Ports', value: activePorts, icon: Activity, colorClass: 'bg-green-100 text-green-600' },
        { label: 'Utilization', value: `${Math.round((activePorts/totalPorts)*100)}%`, icon: Users, colorClass: 'bg-orange-100 text-orange-600' },
    ];
  }, []);

  // Pie Chart Data for current switch
  const portData = useMemo(() => {
    if (!activeSwitch) return [];
    const active = activeSwitch.ports.filter(p => p.status === PortStatus.ACTIVE).length;
    const idle = activeSwitch.ports.filter(p => p.status === PortStatus.IDLE).length;
    return [
        { name: 'Active', value: active, color: '#22c55e' }, // Green-500
        { name: 'Idle', value: idle, color: '#ef4444' },   // Red-500
    ];
  }, [activeSwitch]);


  if (selectedSwitchId && activeSwitch) {
    // === DETAILED SWITCH VIEW ===
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
            <button 
                onClick={() => setSelectedSwitchId(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Network Overview</span>
            </button>

            <button 
                onClick={() => {
                    setSelectedSwitchId(null);
                    setViewMode('topology');
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors shadow-sm"
            >
                <Network size={16} />
                <span>View in Topology</span>
            </button>
        </div>

        {/* Switch Header Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{activeSwitch.name}</h2>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">📍 {activeSwitch.location}</span>
                    <span className="flex items-center gap-1">🖥️ {activeSwitch.rack}</span>
                    <span className="flex items-center gap-1">🏷️ {activeSwitch.model}</span>
                </div>
            </div>
            <div className="flex gap-3">
                 <div className="text-right px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-gray-500">IP Address</p>
                    <p className="font-mono font-medium text-gray-800">{activeSwitch.ip}</p>
                 </div>
                 <div className="text-right px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-gray-500">Uptime</p>
                    <p className="font-mono font-medium text-green-600">{activeSwitch.uptime}</p>
                 </div>
            </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm px-2">
            <span className="font-medium text-gray-500">Legend:</span>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Active / In-Use</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Idle / Free</span>
            </div>
        </div>

        {/* Visualizer */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Physical Status</h3>
            <SwitchVisualizer 
                switchDetails={activeSwitch} 
                onPortClick={setSelectedPort} 
            />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-4">Port Allocation</h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={portData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {portData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="flex justify-center gap-4 text-sm">
                    {portData.map(d => (
                        <div key={d.name} className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                            <span>{d.name}: {d.value}</span>
                        </div>
                    ))}
                 </div>
            </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-2">
                <h4 className="font-semibold text-gray-700 mb-4">Port List Summary</h4>
                <div className="overflow-auto max-h-48">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 sticky top-0">
                            <tr>
                                <th className="p-2">Port</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Device</th>
                                <th className="p-2">VLAN</th>
                                <th className="p-2">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeSwitch.ports.slice(0, 10).map(p => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPort(p)}>
                                    <td className="p-2 font-mono">#{p.portNumber}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${p.status === PortStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="p-2 text-gray-700">{p.deviceConnected || '-'}</td>
                                    <td className="p-2 text-gray-500">{p.vlan || '-'}</td>
                                    <td className="p-2 text-gray-500">{p.deviceType}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={5} className="p-2 text-center text-gray-400 italic">
                                    ... and {activeSwitch.ports.length - 10} more ports
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <PortDetailModal 
            port={selectedPort} 
            switchName={activeSwitch.name}
            onClose={() => setSelectedPort(null)} 
        />
      </div>
    );
  }

  // === MAIN NETWORK OVERVIEW ===
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       
       {/* Summary Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.colorClass}`}>
                    <stat.icon size={24} />
                </div>
            </div>
        ))}
       </div>

       {/* List of Switches / Topology Toggle */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-800">Network Devices</h2>
                
                {/* View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <List size={16} /> List
                    </button>
                    <button 
                        onClick={() => setViewMode('topology')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'topology' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Network size={16} /> Schema
                    </button>
                    <button 
                        onClick={() => setViewMode('wiring')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'wiring' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Cable size={16} /> Wiring
                    </button>
                </div>
            </div>

            <div className="flex gap-2">
                 <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200">
                    <Filter size={16} /> Filter
                 </button>
                 <button className="px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
                    + Add Device
                 </button>
            </div>
        </div>
        
        {viewMode === 'list' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {MOCK_SWITCHES.map(sw => (
                    <div 
                        key={sw.id} 
                        onClick={() => setSelectedSwitchId(sw.id)}
                        className="group border border-gray-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 transition-all cursor-pointer bg-white"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-800 rounded-lg text-white group-hover:bg-brand-600 transition-colors">
                                <Server size={24} />
                            </div>
                            <div className="text-right">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{sw.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{sw.location} • {sw.rack}</p>
                        
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ports</span>
                                <span className="font-medium text-gray-800">{sw.totalPorts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Usage</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-brand-500" 
                                            style={{ width: `${(sw.ports.filter(p=>p.status===PortStatus.ACTIVE).length / sw.totalPorts) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {Math.round((sw.ports.filter(p=>p.status===PortStatus.ACTIVE).length / sw.totalPorts) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs text-gray-400">IP: {sw.ip}</span>
                            <span className="text-xs font-medium text-brand-600 group-hover:underline">View Status &rarr;</span>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {viewMode === 'topology' && (
            <div className="p-6">
                <TopologyDiagram />
            </div>
        )}

        {viewMode === 'wiring' && (
            <div className="p-6">
                <WiringSchedule />
            </div>
        )}

       </div>
    </div>
  );
};
