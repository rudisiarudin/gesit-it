'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Tag, BadgeCheck, Hash, Settings, MapPin, User, StickyNote,
  Cpu, HardDrive, MemoryStick, MonitorSmartphone, Building2, Users, CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';

interface Asset {
  id: string;
  item_name: string;
  category: string;
  brand: string;
  serial_number: string;
  status: string;
  location: string;
  user_assigned: string;
  remarks?: string;
  processor?: string;
  storage?: string;
  ram?: string;
  vga?: string;
  company?: string;
  department?: string;
  purchase_date?: string;
}

export default function AssetDetailClient() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assetId) fetchAsset(assetId);
  }, [assetId]);

  const fetchAsset = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('it_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching asset:', error);
      setAsset(null);
    } else {
      setAsset(data);
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

  if (!asset) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen text-red-500 text-lg">
        Asset not found or invalid ID.
      </div>
    );
  }

  const isLaptopOrPC = ['laptop', 'pc'].includes(asset.category.toLowerCase());

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">IT Asset Detail</h1>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{asset.item_name}</p>
            <p className="text-sm text-gray-500 font-mono">NO ID : {asset.id}</p>
          </div>

          {/* Informasi Dasar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <DetailItem icon={<User size={16} />} label="User Assigned" value={asset.user_assigned} />
            <DetailItem icon={<Tag size={16} />} label="Category" value={asset.category} />
            <DetailItem icon={<BadgeCheck size={16} />} label="Brand" value={asset.brand} />
            <DetailItem icon={<Hash size={16} />} label="Serial Number" value={asset.serial_number} />
            <DetailItem icon={<Settings size={16} />} label="Status" value={asset.status} />
            <DetailItem icon={<MapPin size={16} />} label="Location" value={asset.location} />
            <DetailItem icon={<Building2 size={16} />} label="Company" value={asset.company || '-'} />
            <DetailItem icon={<Users size={16} />} label="Department" value={asset.department || '-'} />
            <DetailItem icon={<CalendarDays size={16} />} label="Purchase Date" value={formatDate(asset.purchase_date)} />
            <DetailItem icon={<StickyNote size={16} />} label="Remarks" value={asset.remarks || '-'} />
          </div>

          {/* Spesifikasi Teknis */}
          {isLaptopOrPC && (
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <DetailItem icon={<Cpu size={16} />} label="Processor" value={asset.processor || '-'} />
                <DetailItem icon={<HardDrive size={16} />} label="Storage" value={asset.storage || '-'} />
                <DetailItem icon={<MemoryStick size={16} />} label="RAM" value={asset.ram || '-'} />
                <DetailItem icon={<MonitorSmartphone size={16} />} label="VGA" value={asset.vga || '-'} />
              </div>
            </div>
          )}
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

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return '-';
  }
}
