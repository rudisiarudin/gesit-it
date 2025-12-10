// src/components/network/NetworkDetail.tsx

import React, { useMemo } from 'react';
import { 
    GitBranch, 
    Router, 
    Database, 
    MapPin, 
    ListChecks,
    AlertTriangle,
    CheckCircle,
    Server,
    Tag,
    Zap,
    Users
} from 'lucide-react';

// Menggunakan Path Alias yang telah dikonfirmasi berfungsi
import { MOCK_SWITCHES } from '@/constants'; // DIGANTI DARI '../../constants'
import { PortStatus } from '@/types'; // DIGANTI DARI '../../types'

// Tipe untuk card statistik
interface DetailCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
        <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <Icon size={24} className={color} />
        </div>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
);

// Sub-komponen untuk alokasi layanan
const ServiceAllocation: React.FC<{ icon: React.ElementType, label: string, count: number, color: string }> = ({ icon: Icon, label, count, color }) => (
    <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-xs border border-gray-100">
        <div className="flex items-center gap-2">
            <Icon size={16} className={color}/>
            <span className="text-gray-700 text-sm">{label}</span>
        </div>
        <span className="font-bold text-lg text-gray-800">{count}</span>
    </div>
);


export const NetworkDetail: React.FC = () => {
    
    // Perhitungan Statistik Jaringan Global
    const networkSummary = useMemo(() => {
        const stats = {
            totalDevices: MOCK_SWITCHES.length,
            totalPorts: 0,
            totalActivePorts: 0,
            totalFaultyPorts: 0,
            uniqueVLANs: new Set<number>(),
            totalServers: 0,
            totalUplinks: 0,
            totalOffline: 0,
        };

        MOCK_SWITCHES.forEach(sw => {
            stats.totalPorts += sw.totalPorts;
            if (sw.status === 'Active') {
                sw.ports.forEach(p => {
                    stats.uniqueVLANs.add(p.vlan);
                    if (p.status === PortStatus.ACTIVE) {
                        stats.totalActivePorts++;
                    }
                    if (p.status === PortStatus.FAULTY) {
                        stats.totalFaultyPorts++;
                    }
                    if (p.deviceType === 'SERVER') {
                        stats.totalServers++;
                    }
                    if (p.deviceType === 'UPLINK') {
                        stats.totalUplinks++;
                    }
                });
            } else {
                stats.totalOffline++;
            }
        });
        
        const activeSwitches = MOCK_SWITCHES.length - stats.totalOffline;
        const portUtilization = stats.totalPorts > 0 ? ((stats.totalActivePorts / stats.totalPorts) * 100).toFixed(1) : '0.0';

        return {
            ...stats,
            activeSwitches,
            portUtilization,
            totalVLANs: stats.uniqueVLANs.size,
        };
    }, []);

    // Pemetaan VLAN (Contoh sederhana)
    const vlanMap = useMemo(() => {
        const map = new Map<number, { count: number, devices: Set<string> }>();
        MOCK_SWITCHES.forEach(sw => {
            sw.ports.forEach(p => {
                if (p.vlan) {
                    const vlan = p.vlan;
                    if (!map.has(vlan)) {
                        map.set(vlan, { count: 0, devices: new Set() });
                    }
                    map.get(vlan)!.count++;
                }
            });
        });
        return Array.from(map.entries())
            .map(([vlan, data]) => ({ vlan, count: data.count }))
            .sort((a, b) => a.vlan - b.vlan);
    }, []);

    
    return (
        <div className="space-y-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                <GitBranch size={24} className="text-indigo-600"/> Network Health & Configuration Overview
            </h2>

            {/* Bagian 1: Ringkasan Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DetailCard 
                    title="Active Devices" 
                    value={`${networkSummary.activeSwitches} / ${networkSummary.totalDevices}`}
                    icon={CheckCircle} 
                    color="text-green-600"
                    subtitle={`${networkSummary.totalOffline} Device Offline`}
                />
                <DetailCard 
                    title="Port Utilization" 
                    value={`${networkSummary.portUtilization}%`}
                    icon={TrendingUp} 
                    color="text-blue-600"
                    subtitle={`Total: ${networkSummary.totalActivePorts} ports used`}
                />
                 <DetailCard 
                    title="Faulty Ports" 
                    value={networkSummary.totalFaultyPorts}
                    icon={AlertTriangle} 
                    color="text-yellow-600"
                    subtitle="Membutuhkan perhatian segera"
                />
                 <DetailCard 
                    title="Total VLANs" 
                    value={networkSummary.totalVLANs}
                    icon={Tag} 
                    color="text-indigo-600"
                    subtitle="VLAN unik yang terdeteksi"
                />
            </div>

            {/* Bagian 2: Alokasi VLAN & Layanan */}
            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Database size={20} className="text-indigo-500"/> Resource & Service Allocation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ringkasan VLAN */}
                    <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-3 border-b pb-2">VLAN Configuration ({networkSummary.totalVLANs} total)</p>
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {vlanMap.map(v => (
                                <li key={v.vlan} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-gray-400"/>
                                        <span className="font-semibold text-gray-800">VLAN {v.vlan}</span>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">{v.count} Ports</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Alokasi Perangkat */}
                    <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-3 border-b pb-2">Device & Connection Breakdown</p>
                        <div className="space-y-2 text-sm">
                            <ServiceAllocation icon={Users} label="User/Client Devices" count={networkSummary.totalActivePorts - networkSummary.totalServers - networkSummary.totalUplinks} color="text-green-600"/>
                            <ServiceAllocation icon={Server} label="Critical Servers" count={networkSummary.totalServers} color="text-blue-600"/>
                            <ServiceAllocation icon={Router} label="Uplink Connections" count={networkSummary.totalUplinks} color="text-indigo-600"/>
                            <ServiceAllocation icon={MapPin} label="Total Locations Monitored" count={new Set(MOCK_SWITCHES.map(s => s.location)).size} color="text-yellow-600"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
