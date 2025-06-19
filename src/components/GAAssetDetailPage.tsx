'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import {
  BadgeCheck,
  MapPin,
  Tag,
  Package,
  Hash,
  User,
  StickyNote,
  Settings
} from 'lucide-react';

interface GAAsset {
  id: string;
  item_name: string;
  category: string;
  brand: string;
  serial_number: string;
  status: string;
  location: string;
  user_assigned: string;
  remarks: string;
  qr_value: string;
}

export default function GAAssetDetailPage() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');
  const [asset, setAsset] = useState<GAAsset | null>(null);

  useEffect(() => {
    if (!assetId) return;

    const fetchAsset = async () => {
      const { data, error } = await supabase
        .from('ga_assets')
        .select('*')
        .eq('id', assetId)
        .single();

      if (!error && data) setAsset(data);
      else console.error('Fetch error:', error);
    };

    fetchAsset();
  }, [assetId]);

  if (!assetId) {
    return <div className="p-6 text-red-500 text-center">No asset ID provided.</div>;
  }

  if (!asset) {
    return <div className="p-6 text-gray-500 text-center">Loading asset data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-200">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">GA Asset Detail</h1>
          <p className="text-gray-600 text-sm">
            Item Name: <span className="font-semibold">{asset.item_name}</span>
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="p-4 border rounded-lg shadow-sm">
            <QRCodeCanvas value={asset.qr_value} size={160} />
          </div>
          <p className="text-gray-600 text-sm">
            ID: <span className="font-semibold">{asset.id}</span>
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
