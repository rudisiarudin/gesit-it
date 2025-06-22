'use client';

import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FileDown, Archive } from 'lucide-react';
import ImportExcel from './ImportExcel';
import { Asset } from '@/app/dashboard/it-assets/page';

type Props = {
  assets: Asset[];
  userId: string;
  fetchAssets: () => void; // ✅ sebelumnya tidak dipakai
};

const ExportButtons: React.FC<Props> = ({ assets, userId, fetchAssets }) => {
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(assets);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IT Assets');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'it_assets.xlsx');
  };

  const handleDownloadAllQR = async () => {
    const zip = new JSZip();

    for (const asset of assets) {
      const canvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
      if (!canvas) continue;

      const dataUrl = canvas.toDataURL('image/png');
      const imgData = dataUrl.split(',')[1];
      const fileName = `QR-${asset.item_name.replace(/[\\/:*?"<>|]/g, '-')}.png`;

      zip.file(fileName, imgData, { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'all-qr-codes.zip');
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

      {/* Import Excel */}
      <div className="ml-auto">
        <ImportExcel userId={userId} fetchAssets={fetchAssets} /> {/* ✅ prop lengkap */}
      </div>
    </div>
  );
};

export default ExportButtons;
