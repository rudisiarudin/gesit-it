import { Metadata } from 'next';
// ⚠️ PERUBAHAN UTAMA: Mengganti NetworkDeviceList dengan NetworkDashboard
import { NetworkDashboard } from '@/components/network/NetworkDashboard'; 
import { NetworkDetail } from '@/components/network/NetworkDetail';

export const metadata: Metadata = {
    title: 'Network & Wiring | IT Gesit',
};

export default function NetworkWiringPage() {
    return (
        <div className="space-y-6">
            
            {/* Header Halaman */}
            <header className="mb-4">
                <h1 className="text-3xl font-extrabold text-slate-800">Network & Wiring Dashboard</h1>
                <p className="text-gray-600">Overview of device health, port status, and network configuration.</p>
            </header>

            {/* Komponen NetworkDashboard:
              Ini akan menampilkan dua mode:
              1. Main Overview (List Switch/Topology, menggunakan NetworkDetail untuk Ringkasan Global)
              2. Detailed Switch View (Manajemen Port dan Visualizer)
            */}
            <NetworkDashboard />
            
        </div>
    );
}
