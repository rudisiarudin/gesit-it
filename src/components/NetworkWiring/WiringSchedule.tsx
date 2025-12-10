'use client';

import React, { useState } from 'react';
import { Search, Download, ArrowRight } from 'lucide-react';
import { MOCK_SWITCHES } from '../constants';
import { PortStatus } from '../types';

export const WiringSchedule: React.FC = () => {
  const [filter, setFilter] = useState('');
  
  // Flatten all ports into a single searchable list
  const allConnections = MOCK_SWITCHES.flatMap(sw => 
    sw.ports.map(port => ({
      switchName: sw.name,
      switchId: sw.id,
      port: port,
      uplink: MOCK_SWITCHES.find(s => s.id === port.uplinkDeviceId)?.name
    }))
  ).filter(item => item.port.status !== PortStatus.DISABLED);

  const filteredConnections = allConnections.filter(item => {
    const searchStr = filter.toLowerCase();
    return (
      item.switchName.toLowerCase().includes(searchStr) ||
      item.port.deviceConnected?.toLowerCase().includes(searchStr) ||
      item.port.patchPanelPort?.toLowerCase().includes(searchStr) ||
      item.uplink?.toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-250px)] animate-in fade-in duration-300">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <h3 className="font-bold text-gray-800">Wiring Schedule & Cable Management</h3>
        <div className="flex gap-2">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search connection..."
                    className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                <Download size={16} /> Export CSV
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="p-3 font-semibold">Source Device</th>
                    <th className="p-3 font-semibold">Port ID</th>
                    <th className="p-3 font-semibold">Patch Panel / ID</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                    <th className="p-3 font-semibold text-center">Connection</th>
                    <th className="p-3 font-semibold">Remote Device / Uplink</th>
                    <th className="p-3 font-semibold">Cable Spec</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredConnections.map((conn, idx) => (
                    <tr key={`${conn.switchId}-${conn.port.id}-${idx}`} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-3 font-medium text-gray-800">{conn.switchName}</td>
                        <td className="p-3 font-mono text-gray-600">Port {conn.port.portNumber}</td>
                        <td className="p-3">
                            <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200 font-mono text-xs">
                                {conn.port.patchPanelPort || 'N/A'}
                            </span>
                        </td>
                        <td className="p-3 text-center">
                             <div className={`w-2 h-2 mx-auto rounded-full ${conn.port.status === PortStatus.ACTIVE ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </td>
                        <td className="p-3 text-center text-gray-400">
                            <ArrowRight size={14} className="mx-auto" />
                        </td>
                        <td className="p-3">
                            {conn.uplink ? (
                                <span className="flex items-center gap-1.5 text-brand-600 font-semibold bg-brand-50 px-2 py-1 rounded w-fit">
                                    Link: {conn.uplink}
                                </span>
                            ) : (
                                <span className="text-gray-700">{conn.port.deviceConnected || '-'}</span>
                            )}
                        </td>
                        <td className="p-3 text-gray-500 text-xs">
                            {conn.port.cableLength ? `${conn.port.cableLength} ` : ''}
                            {conn.port.deviceType === 'Uplink' ? 'Fiber/Cat6' : 'Cat5e'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-right rounded-b-xl">
        Showing {filteredConnections.length} connections
      </div>
    </div>
  );
};
