'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  BadgeCheck,
  MapPin,
  Tag,
  Hash,
  User,
  StickyNote,
  Settings,
  ImageIcon,
  X,
  CalendarDays,
  QrCode,
  CarFront,
  Building,
  Wrench,
  CalendarClock
} from 'lucide-react';

interface GAAsset {
  id: string;
  item_name: string;
  category: string;
  brand: string | null;
  serial_number: string | null;
  status: string;
  location: string;
  user_assigned: string | null;
  remarks: string | null;
  image_url?: string | null;
  qr_value: string;
  user_id?: string | null;
  created_at?: string | null;
  no_plate?: string | null;
  vehicle_type?: string | null;
  condition?: string | null;
  department?: string | null;
  purchase_date?: string | null;
  stnk_expiry?: string | null;
}

export default function GAAssetDetailPage() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get('id');
  const [asset, setAsset] = useState<GAAsset | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!assetId) return;
    const fetchAsset = async () => {
      const { data } = await supabase
        .from('ga_assets')
        .select('*')
        .eq('id', assetId)
        .single();

      if (data) setAsset(data);
    };
    fetchAsset();
  }, [assetId]);

  if (!assetId) return <div className="p-6 text-red-500 text-center">No asset ID provided.</div>;
  if (!asset) return <div className="p-6 text-gray-500 text-center">Loading asset data...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">GA Asset Detail</h1>

          <div className="bg-white rounded-xl shadow-md p-6 space-y-6 border border-gray-200">
            {/* ✅ Image Section */}
            <div className="w-full flex justify-center">
              {asset.image_url ? (
                <img
                  src={asset.image_url}
                  alt={asset.item_name}
                  className="max-h-64 rounded object-contain border cursor-zoom-in"
                  onClick={() => setShowModal(true)}
                />
              ) : (
                <div className="text-gray-400 flex items-center gap-2 italic">
                  <ImageIcon size={24} />
                  No image uploaded
                </div>
              )}
            </div>

            {/* ✅ Modal Zoom Preview */}
            {showModal && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                onClick={() => setShowModal(false)}
              >
                <button
                  className="absolute top-6 right-6 text-white hover:text-red-400"
                  onClick={() => setShowModal(false)}
                >
                  <X size={32} />
                </button>
                <img
                  src={asset.image_url || ''}
                  alt="Zoom Preview"
                  className="max-h-[90vh] max-w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* ✅ Header */}
            <div className="text-center space-y-1">
              <p className="text-xl font-semibold text-gray-800">{asset.item_name}</p>
              <p className="text-sm text-gray-500 font-mono">ID: {asset.id}</p>
            </div>

            {/* ✅ Detail Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <DetailItem icon={<User size={16} />} label="User Assigned" value={asset.user_assigned} />
              <DetailItem icon={<Tag size={16} />} label="Category" value={asset.category} />
              <DetailItem icon={<BadgeCheck size={16} />} label="Brand" value={asset.brand} />
              <DetailItem icon={<Hash size={16} />} label="Serial Number" value={asset.serial_number} />
              <DetailItem icon={<Settings size={16} />} label="Status" value={asset.status} />
              <DetailItem icon={<MapPin size={16} />} label="Location" value={asset.location} />
              <DetailItem icon={<Wrench size={16} />} label="Condition" value={asset.condition} />
              <DetailItem icon={<Building size={16} />} label="Department" value={asset.department} />
              <DetailItem icon={<CalendarClock size={16} />} label="Purchase Date" value={asset.purchase_date} />
              <DetailItem icon={<CalendarDays size={16} />} label="Created At" value={asset.created_at} />
              <div className="col-span-1 md:col-span-2">
                <DetailItem icon={<StickyNote size={16} />} label="Remarks" value={asset.remarks} />
              </div>
            </div>

            {/* ✅ Kendaraan */}
            {asset.category === 'Kendaraan' && (
              <>
                <h2 className="text-lg font-semibold text-gray-700 pt-4">Kendaraan Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <DetailItem icon={<CarFront size={16} />} label="No Plat" value={asset.no_plate} />
                  <DetailItem icon={<CarFront size={16} />} label="Jenis Kendaraan" value={asset.vehicle_type} />
                  <DetailItem icon={<CalendarDays size={16} />} label="STNK Expiry" value={asset.stnk_expiry} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Footer */}
      <footer className="bg-gray-100 text-center text-sm text-gray-600 py-4 border-t mt-6">
        © {new Date().getFullYear()} IT Gesit — GA Asset Management System
      </footer>
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
  value: React.ReactNode | string | null | undefined;
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
