'use client';

import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Archive } from 'lucide-react';
import { Asset } from '@/app/dashboard/it-assets/page';

type Props = {
  assets: Asset[];
};

const DownloadAllQRButton: React.FC<Props> = ({ assets }) => {
  const handleDownload = async () => {
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
    <button
      onClick={handleDownload}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-1"
    >
      <Archive size={18} />
      Download QR All
    </button>
  );
};

export default DownloadAllQRButton;
