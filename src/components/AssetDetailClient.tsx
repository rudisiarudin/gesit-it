'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Tag, BadgeCheck, Hash, Settings, MapPin, User, StickyNote,
  Cpu, HardDrive, MemoryStick, MonitorSmartphone, Building2, Users, CalendarDays,
  ScanLine,
} from 'lucide-react';
import { format } from 'date-fns';

interface ITAsset {
  id: string;                 // contoh: GA-LP-001 (atau sesuai skema kamu)
  item_name: string;
  category: string;
  brand?: string | null;
  serial_number?: string | null;
  status: string;
  location: string;
  user_assigned?: string | null;
  remarks?: string | null;
  processor?: string | null;
  storage?: string | null;
  ram?: string | null;
  vga?: string | null;
  company?: string | null;
  department?: string | null;
  purchase_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export default function ITAssetDetail() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id'); // IT sebelumnya pakai ?id=
  const [asset, setAsset] = useState<ITAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assetId) fetchAsset(assetId);
    else setLoading(false);
  }, [assetId]);

  const fetchAsset = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('it_assets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching IT asset:', error);
      setAsset(null);
    } else {
      setAsset(data as ITAsset);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen text-gray-500 text-lg">
        Loading asset details...
      </div>
    );
  }

  if (!assetId) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen text-gray-600 text-center">
        Tidak ada <b>id</b> pada URL.
        <br />
        Contoh: <code>/asset-it?id=GA-LP-001</code>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen text-red-500 text-lg">
        Asset not found or invalid ID.
      </div>
    );
  }

  const isLaptopOrPC =
    ['laptop', 'pc', 'computer'].includes((asset.category || '').toLowerCase());

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          IT Asset Detail
        </h1>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Banner (samakan dengan GBP) */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            <div className="font-semibold">
              IT — Asset Detail
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
              <p className="text-3xl md:text-4xl font-bold text-gray-900">{asset.item_name}</p>
              <p className="text-sm text-gray-500 font-mono">ASSET ID : {asset.id}</p>
            </div>

            {/* Informasi Dasar (grid 2 kolom, sama pattern dengan GBP) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <DetailItem icon={<User size={16} />} label="User Assigned" value={asset.user_assigned || '-'} />
              <DetailItem icon={<Tag size={16} />} label="Category" value={asset.category} />
              <DetailItem icon={<BadgeCheck size={16} />} label="Brand" value={asset.brand || '-'} />
              <DetailItem icon={<Hash size={16} />} label="Serial Number" value={asset.serial_number || '-'} />
              <DetailItem icon={<Settings size={16} />} label="Status" value={asset.status} />
              <DetailItem icon={<MapPin size={16} />} label="Location" value={asset.location} />
              <DetailItem icon={<Building2 size={16} />} label="Company" value={asset.company || '-'} />
              <DetailItem icon={<Users size={16} />} label="Department" value={asset.department || '-'} />
              <DetailItem icon={<CalendarDays size={16} />} label="Purchase Date" value={formatDate(asset.purchase_date)} />
              <DetailItem icon={<StickyNote size={16} />} label="Remarks" value={asset.remarks || '-'} />
            </div>

            {/* Spesifikasi Teknis (muncul bila Laptop/PC/Computer) */}
            {isLaptopOrPC && (
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <DetailItem icon={<Cpu size={16} />} label="Processor" value={asset.processor || '-'} />
                  <DetailItem icon={<MemoryStick size={16} />} label="RAM" value={asset.ram || '-'} />
                  <DetailItem icon={<HardDrive size={16} />} label="Storage" value={asset.storage || '-'} />
                  <DetailItem icon={<MonitorSmartphone size={16} />} label="VGA" value={asset.vga || '-'} />
                </div>
              </div>
            )}
          </div>

          {/* Meta (opsional; hapus kalau nggak perlu) */}
          <div className="px-6 py-3 border-t text-xs text-gray-500 flex items-center justify-between">
            <div>Created: {asset.created_at ? new Date(asset.created_at).toLocaleString() : '-'}</div>
            <div>Updated: {asset.updated_at ? new Date(asset.updated_at).toLocaleString() : '-'}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-gray-500 text-sm py-6 border-t bg-gray-50">
        &copy; {new Date().getFullYear()} Gesit IT Asset Management. All rights reserved.
      </footer>
    </>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-md shadow-sm">
      <div className="text-gray-500 mt-1">{icon}</div>
      <div>
        <p className="text-gray-600 text-xs uppercase font-semibold tracking-wide">{label}</p>
        <p className="text-gray-800 font-medium break-words">{value || '-'}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return '-';
  }
}
