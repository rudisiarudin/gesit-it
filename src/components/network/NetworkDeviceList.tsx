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
import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/lib/supabaseClient"; // Sesuaikan path ini jika perlu

// --- Interface Data ---
interface Device {
  id: number;
  name: string;
  type: string;
  location: string;
  ports: number;
  usage: number; // Persentase usage
  ip: string;
}

// --- Komponen Kartu Statistik ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, unit }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <div className="text-2xl font-bold text-gray-800">
        {value}
        {unit && <span className="text-sm font-medium ml-1 text-gray-600">{unit}</span>}
      </div>
    </div>
    <div className={`p-2 rounded-lg ${color} text-white`}>
      {icon}
    </div>
  </div>
);

// --- Komponen Kartu Perangkat Jaringan ---
interface DeviceCardProps {
  device: Device;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const usageColor = device.usage > 75 ? 'text-red-600' : device.usage > 50 ? 'text-blue-700' : 'text-slate-600';
  const portsLabel = device.ports === 0 ? 'N/A' : `${device.ports}`;

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
            {device.type.includes('Switch') || device.type.includes('Router') ? <Server size={20} /> : <LinkIcon size={20} />}
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{device.name}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <Menu size={18} />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">{device.location}</p>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <p className="text-xs text-gray-500">Ports</p>
          <p className="text-xl font-bold text-gray-700">{portsLabel}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Usage</p>
          <p className={`text-xl font-bold ${usageColor}`}>{device.usage}%</p>
          <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
            <div
              className={`h-1 rounded-full ${device.usage > 75 ? 'bg-red-500' : device.usage > 50 ? 'bg-blue-500' : 'bg-gray-400'}`}
              style={{ width: `${device.usage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-gray-600">IP: {device.ip}</span>
        <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-xs">
          View Status
        </a>
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

  // Logika Fetching Data dari Supabase
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('network_devices') // Ganti 'network_devices' dengan nama tabel Anda
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
    };

    fetchDevices();
  }, []);

  // Menghitung ringkasan statistik
  const networkSummary = useMemo(() => {
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


  return (
    <>
      {/* Statistik Atas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
            {/* Tombol View Mode */}
            <div className="flex border rounded-lg overflow-hidden">
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
            <button className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus size={16} className="mr-1" /> Add Device
            </button>
          </div>
        </div>

        {/* Tampilan Konten */}
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

            {/* Placeholder untuk Tampilan Skema */}
            {viewMode === 'schema' && (
              <div className="min-h-[400px] flex items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-500">
                [Diagram Skema Jaringan akan ditampilkan di sini]
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
