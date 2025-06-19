'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Tag, BadgeCheck, Hash, Settings, MapPin, User, StickyNote,
  Cpu, HardDrive, MemoryStick, MonitorSmartphone,
} from 'lucide-react';

interface Asset {
  id: string;
  item_name: string;
  category: string;
  brand: string;
  serial_number: string;
  status: string;
  location: string;
  user_assigned: string;
  remarks: string;
  storage?: string;
  ram?: string;
  vga?: string;
  processor?: string;
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
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-200">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">IT Asset Detail</h1>
          <p className="text-gray-600 text-sm">
            Item Name: <span className="font-semibold">{asset.item_name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <DetailItem icon={<User size={16} />} label="User Assigned" value={asset.user_assigned} />
          <DetailItem icon={<Tag size={16} />} label="Category" value={asset.category} />
          <DetailItem icon={<BadgeCheck size={16} />} label="Brand" value={asset.brand} />
          <DetailItem icon={<Hash size={16} />} label="Serial Number" value={asset.serial_number} />
          <DetailItem icon={<Settings size={16} />} label="Status" value={asset.status} />
          <DetailItem icon={<MapPin size={16} />} label="Location" value={asset.location} />
          <div className="col-span-1 md:col-span-2">
            <DetailItem icon={<StickyNote size={16} />} label="Remarks" value={asset.remarks} />
          </div>

          {isLaptopOrPC && (
            <>
              <DetailItem icon={<Cpu size={16} />} label="Processor" value={asset.processor || '-'} />
              <DetailItem icon={<HardDrive size={16} />} label="Storage" value={asset.storage || '-'} />
              <DetailItem icon={<MemoryStick size={16} />} label="RAM" value={asset.ram || '-'} />
              <DetailItem icon={<MonitorSmartphone size={16} />} label="VGA" value={asset.vga || '-'} />
            </>
          )}
        </div>
      </div>
    </div>
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
