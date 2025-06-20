'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';

interface Asset {
  id: number;
  item_name: string;
  qr_value: string;
}

export default function PrintQRPage() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      const { data } = await supabase
        .from('it_assets')
        .select('id, item_name, qr_value')
        .order('id', { ascending: true });

      if (data) setAssets(data);
    };

    fetchAssets();
  }, []);

  return (
    <div className="p-6 print:p-0">
      <h1 className="text-xl font-bold mb-4 print:hidden">Print QR Asset</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-4">
        {assets.map((asset) => (
          <div key={asset.id} className="border p-3 rounded shadow text-center">
            <QRCodeCanvas value={asset.qr_value} size={128} />
            <p className="mt-2 text-sm">{asset.item_name}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Print
        </button>
      </div>
    </div>
  );
}
