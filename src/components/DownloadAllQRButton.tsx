'use client';

import React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Archive } from 'lucide-react'; // ⬅️ Tambahkan ini

type Asset = {
  id: string;
  item_name: string;
  qr_value: string;
};

type Props = {
  assets: Asset[];
};

const DownloadAllQRButton: React.FC<Props> = ({ assets }) => {
  const handleDownloadAllQR = async () => {
    const zip = new JSZip();

    for (const asset of assets) {
      const canvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
      if (!canvas) continue;

      const qrSize = 1024;
      const labelHeight = 160;
      const padding = 40;

      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = qrSize + padding * 2;
      combinedCanvas.height = qrSize + labelHeight + padding * 2;

      const ctx = combinedCanvas.getContext('2d');
      if (!ctx) continue;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, combinedCanvas.width, combinedCanvas.height);

      ctx.drawImage(canvas, padding, padding, qrSize, qrSize);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = 'bold 48px Arial';
      ctx.fillText(asset.item_name, combinedCanvas.width / 2, qrSize + padding + 70);
      ctx.font = '36px Arial';
      ctx.fillText(`ID: ${asset.id}`, combinedCanvas.width / 2, qrSize + padding + 120);

      const blob = await new Promise<Blob | null>((resolve) =>
        combinedCanvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob) {
        const safeName = asset.item_name.replace(/[<>:"/\\|?*]+/g, '-');
        zip.file(`QR-${safeName}.png`, blob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'All-QR-Codes.zip');
  };

  return (
    <button
      onClick={handleDownloadAllQR}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      <Archive size={18} />
      Download All QR Codes
    </button>
  );
};

export default DownloadAllQRButton;
