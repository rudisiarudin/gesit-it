// src/components/network/NetworkIPandVLANList.tsx

import React, { useState, useMemo } from 'react';
import { 
    Search, 
    ChevronDown, 
    ChevronUp, 
    Filter, 
    Tag, 
    Globe, 
    Link as LinkIcon 
} from 'lucide-react';
import { MOCK_SWITCHES } from '../../constants';
import { SwitchPort } from '../../types';

// Tipe data gabungan untuk tabel
interface ConsolidatedPortData extends SwitchPort {
    switchName: string;
    switchIP: string;
}

// Fungsi untuk mengkonsolidasikan data dari semua switch menjadi satu array
const consolidateData = (): ConsolidatedPortData[] => {
    return MOCK_SWITCHES.flatMap(sw => 
        sw.ports.map(port => ({
            ...port,
            switchName: sw.name,
            switchIP: sw.ip,
        }))
    );
};

// Interface untuk state sorting
interface SortState {
    key: keyof ConsolidatedPortData | 'switchName';
    direction: 'ascending' | 'descending';
}

export const NetworkIPandVLANList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortState, setSortState] = useState<SortState>({ 
        key: 'portNumber', 
        direction: 'ascending' 
    });

    const consolidatedPorts = useMemo(() => consolidateData(), []);

    // 1. Filtering Logic
    const filteredPorts = useMemo(() => {
        if (!searchTerm) return consolidatedPorts;
        const lowerCaseSearch = searchTerm.toLowerCase();

        return consolidatedPorts.filter(port => 
            port.ipAddress?.toLowerCase().includes(lowerCaseSearch) ||
            port.deviceConnected?.toLowerCase().includes(lowerCaseSearch) ||
            port.description?.toLowerCase().includes(lowerCaseSearch) ||
            port.switchName.toLowerCase().includes(lowerCaseSearch) ||
            port.switchIP.includes(lowerCaseSearch) ||
            port.vlan.toString().includes(lowerCaseSearch)
        );
    }, [consolidatedPorts, searchTerm]);

    // 2. Sorting Logic
    const sortedPorts = useMemo(() => {
        const sorted = [...filteredPorts];
        const { key, direction } = sortState;

        sorted.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            // Handle sorting based on the composite key (switchName)
            if (key === 'switchName') {
                 aValue = a.switchName;
                 bValue = b.switchName;
            } else {
                 aValue = a[key as keyof SwitchPort];
                 bValue = b[key as keyof SwitchPort];
            }
            
            // Handle numerical and null/undefined values
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === 'ascending' ? aValue - bValue : bValue - aValue;
            }
            
            const stringA = (aValue || '').toString().toLowerCase();
            const stringB = (bValue || '').toString().toLowerCase();

            if (stringA < stringB) return direction === 'ascending' ? -1 : 1;
            if (stringA > stringB) return direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredPorts, sortState]);

    // Handler untuk mengubah kolom sorting
    const handleSort = (key: keyof ConsolidatedPortData | 'switchName') => {
        setSortState(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
        }));
    };

    // Komponen untuk header kolom yang dapat diurutkan
    const SortableHeader: React.FC<{ name: string; sortKey: keyof ConsolidatedPortData | 'switchName' }> = ({ name, sortKey }) => {
        const isCurrentKey = sortState.key === sortKey;
        const Icon = isCurrentKey 
            ? (sortState.direction === 'ascending' ? ChevronUp : ChevronDown) 
            : null;

        return (
            <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleSort(sortKey)}
            >
                <div className="flex items-center gap-1">
                    {name}
                    {Icon && <Icon size={14} className="text-indigo-600"/>}
                </div>
            </th>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Globe size={22} className="text-indigo-600"/> Detailed IP & VLAN Registry ({sortedPorts.length} Entries)
                </h3>
                
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search IP, VLAN, Device, or Switch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>
            </div>

            {/* Tabel Data IP dan VLAN */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader name="Switch" sortKey="switchName" />
                            <SortableHeader name="Port" sortKey="portNumber" />
                            <SortableHeader name="VLAN" sortKey="vlan" />
                            <SortableHeader name="Status" sortKey="status" />
                            <SortableHeader name="IP Address" sortKey="ipAddress" />
                            <SortableHeader name="Device Connected" sortKey="deviceConnected" />
                            <SortableHeader name="Description" sortKey="description" />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {sortedPorts.map((port) => (
                            <tr key={port.id} className="hover:bg-indigo-50/20 transition">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-indigo-700">
                                    {port.switchName}
                                    <span className="block text-xs font-normal text-gray-500 font-mono">{port.switchIP}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">#{port.portNumber}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-bold">
                                    <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">{port.vlan}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 rounded ${
                                        port.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                        port.status === 'IDLE' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {port.status.charAt(0) + port.status.slice(1).toLowerCase()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-blue-600">{port.ipAddress || '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{port.deviceConnected || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{port.description || '-'}</td>
                            </tr>
                        ))}
                        {sortedPorts.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500 text-lg">
                                    No results found. Adjust your search criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
