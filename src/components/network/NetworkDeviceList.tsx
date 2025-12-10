'use client';

import {
  Globe,
  Activity,
  BarChart,
  Grid,
  List,
  Plus,
  Server,
  Link as LinkIcon,
  Filter,
  Menu,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react'; // Import useCallback
import { supabase } from "@/lib/supabaseClient"; 

// --- Import Komponen Lain ---
// Import komponen AddDeviceForm yang sudah Anda buat
import AddDeviceForm from './AddDeviceForm'; // Sesuaikan path jika AddDeviceForm berada di folder berbeda
import NetworkSchemaView from './NetworkSchemaView'; // Import komponen Schema

// --- Interface Data (Tetap sama) ---
interface Device {
// ... (Interface Device tetap sama)
  id: number;
  name: string;
  type: string;
  location: string;
  ports: number;
  usage: number;
  ip: string;
}

// ... (Komponen StatCard dan DeviceCard tetap sama) ...
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, unit }) => ( /* ... */ );
const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => ( /* ... */ );


// --- Komponen Modal (Sederhana) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};


// --- Komponen Utama dengan Logika Supabase ---
export default function NetworkDeviceList() {
  const [viewMode, setViewMode] = useState<'list' | 'schema'>('list');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // <--- STATE MODAL BARU

  // Fungsi Fetching Data (Dibuat dengan useCallback agar bisa dipanggil ulang)
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('network_devices') 
        .select('id, name, type, location, ports, usage, ip');

      if (error) {
        throw error;
      }
      setDevices(data as Device[]);
    } catch (err) {
      console.error("Error fetching network devices:", err);
      setError("Gagal memuat data perangkat jaringan dari database.");
    } finally {
      setLoading(false);
    }
  }, []); // Dependensi kosong, hanya dijalankan sekali (atau dipanggil dari luar)

  // Jalankan fetch saat komponen dimuat
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);


  // Menghitung ringkasan statistik (Tetap sama)
  const networkSummary = useMemo(() => {
    // ... (Logika networkSummary tetap sama) ...
    const totalSwitches = devices.filter(d => d.type.includes('Switch') || d.type.includes('Router')).length;
    const totalPorts = devices.reduce((sum, d) => sum + d.ports, 0);
    const totalUsage = devices.reduce((sum, d) => sum + d.usage, 0);
    const averageUsage = devices.length > 0 ? totalUsage / devices.length : 0;
    const simulatedActivePorts = Math.floor(totalPorts * (averageUsage / 100)); 

    return {
      totalSwitches,
      totalPorts,
      activePorts: simulatedActivePorts,
      utilization: Math.round(averageUsage),
    };
  }, [devices]);

  // Handler setelah formulir Add Device sukses
  const handleAddSuccess = () => {
      setIsModalOpen(false); // Tutup modal
      fetchDevices(); // Refresh data list perangkat
  };


  return (
    <>
      {/* Statistik Atas (Tetap sama) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {/* ... (StatCard components) ... */}
        <StatCard title="Total Switches" value={networkSummary.totalSwitches} icon={<Globe size={20} />} color="bg-indigo-500" />
        <StatCard title="Total Ports" value={networkSummary.totalPorts} icon={<Activity size={20} />} color="bg-blue-500" />
        <StatCard title="Active Ports" value={networkSummary.activePorts} icon={<BarChart size={20} />} color="bg-green-500" />
        <StatCard title="Avg. Utilization" value={networkSummary.utilization} unit="%" icon={<Activity size={20} />} color="bg-orange-500" />
        <div className="hidden md:flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
           <span className="text-3xl font-bold text-slate-800">{devices.length}</span>
           <span className="text-sm font-medium ml-2 text-gray-600">Total Devices</span>
        </div>
      </div>

      {/* Bagian Perangkat Jaringan */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Network Devices</h2>
          <div className="flex items-center gap-3">
            {/* Tombol View Mode (Tetap sama) */}
            <div className="flex border rounded-lg overflow-hidden">
                {/* ... (Tombol List dan Schema) ... */}
                <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center px-3 py-1 text-sm font-medium transition ${
                      viewMode === 'list' ? 'bg-gray-200 text-slate-800' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List size={16} className="mr-1" /> List
                  </button>
                  <button
                    onClick={() => setViewMode('schema')}
                    className={`flex items-center px-3 py-1 text-sm font-medium transition ${
                      viewMode === 'schema' ? 'bg-gray-200 text-slate-800' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid size={16} className="mr-1" /> Schema
                  </button>
            </div>
            {/* Filter dan Add Device */}
            <button className="flex items-center px-3 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">
                <Filter size={16} className="mr-1" /> Filter
            </button>
            <button 
                onClick={() => setIsModalOpen(true)} // <--- AKSI TOMBOL TAMBAH DEVICE
                className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} className="mr-1" /> Add Device
            </button>
          </div>
        </div>

        {/* Tampilan Konten (Loading, Error, List, atau Schema) */}
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading data dari Supabase...
          </div>
        ) : error ? (
          <div className="min-h-[300px] flex items-center justify-center text-red-600 border border-red-200 p-4 rounded-lg bg-red-50">
            {error}
          </div>
        ) : devices.length === 0 ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-500 border border-dashed rounded-lg p-6 bg-gray-50">
            <Server size={32} className="mb-3" />
            <p>Tidak ada perangkat jaringan yang ditemukan.</p>
            <p className="text-sm">Silakan tambahkan data di Supabase atau klik 'Add Device'.</p>
          </div>
        ) : (
          <>
            {/* Tampilan Kartu Perangkat */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {devices.map((device) => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            )}

            {/* Tampilan Skema Jaringan */}
            {viewMode === 'schema' && (
              // Asumsi NetworkSchemaView sudah diimpor dan ada di './NetworkSchemaView'
              <NetworkSchemaView /> 
            )}
          </>
        )}
      </div>

      {/* Modal untuk Tambah Device */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          {/* Asumsi AddDeviceForm sudah diimpor dan ada di './AddDeviceForm' */}
          <AddDeviceForm onSuccess={handleAddSuccess} /> 
      </Modal>
    </>
  );
}
