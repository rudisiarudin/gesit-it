import { Metadata } from 'next';
import NetworkDeviceList from '@/components/network/NetworkDeviceList'; // Sesuaikan path import

export const metadata: Metadata = {
  title: 'Network & Wiring | IT Gesit',
};

export default function NetworkWiringPage() {
  return (
    <>
      {/* Header Halaman (Diletakkan di sini karena ini adalah file page) */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Network & Wiring</h1>
        <p className="text-gray-600">Manage switches, ports, and wiring diagrams</p>
      </header>

      {/* Komponen Utama yang Menangani Data dan Tampilan */}
      <NetworkDeviceList />
    </>
  );
}
