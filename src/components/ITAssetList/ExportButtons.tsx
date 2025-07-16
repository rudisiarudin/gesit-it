'use client';

import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FileDown, Archive } from 'lucide-react';
import ImportExcel from './ImportExcel';
import { Asset } from '@/app/dashboard/it-assets/page';
import { createClient } from '@supabase/supabase-js';

type Props = {
  assets: Asset[];
  userId: string;
  fetchAssets: () => void;
  role: string;
};

const ExportButtons: React.FC<Props> = ({ assets, userId, fetchAssets, role }) => {
  const today = new Date().toISOString().split('T')[0];
  const fileName = `it_assets_export_${today}.xlsx`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAllAssets = async (): Promise<Asset[]> => {
    const { data, error } = await supabase
      .from('it_assets')
      .select('*'); // Tambahkan filter jika perlu, misalnya .eq('user_id', userId)

    if (error) {
      console.error('❌ Gagal fetch semua data:', error);
      return [];
    }

    return data as Asset[];
  };

  const handleExportExcel = async () => {
    const allAssets = await fetchAllAssets();
    if (allAssets.length === 0) return;

    const headers = Object.keys(allAssets[0]);

    const data = allAssets.map((asset) =>
      headers.reduce((acc, key) => {
        acc[key] = asset[key as keyof Asset] ?? '';
        return acc;
      }, {} as Record<string, any>)
    );

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IT Assets');

    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  };

  const handleDownloadAllQR = async () => {
    const allAssets = await fetchAllAssets();
    if (allAssets.length === 0) return;

    const zip = new JSZip();

    for (const asset of allAssets) {
      const canvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
      if (!canvas) continue;

      const dataUrl = canvas.toDataURL('image/png');
      const imgData = dataUrl.split(',')[1];
      const fileName = `QR-${asset.item_name.replace(/[\\/:*?"<>|]/g, '-')}.png`;

      zip.file(fileName, imgData, { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `all_qr_codes_${today}.zip`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      {/* Export Excel */}
      <button
        onClick={handleExportExcel}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-1 text-sm"
      >
        <FileDown size={16} />
        Export Excel
      </button>

      {/* Download QR All */}
      <button
        onClick={handleDownloadAllQR}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-1 text-sm"
      >
        <Archive size={16} />
        Download QR All
      </button>

      {/* Import Excel (admin only) */}
      {role === 'admin' && (
        <div className="ml-auto">
          <ImportExcel userId={userId} fetchAssets={fetchAssets} />
        </div>
      )}
    </div>
  );
};

export default ExportButtons;
