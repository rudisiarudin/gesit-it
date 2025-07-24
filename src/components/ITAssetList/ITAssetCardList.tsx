'use client';

import { Pencil, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import { Asset } from '@/app/dashboard/it-assets/page';

interface Props {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => Promise<void>;
  role: string;
}

export default function ITAssetCardList({ assets, onEdit, role }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadQR = async (asset: Asset) => {
    setDownloading(asset.id);

    const canvasWidth = 354;
    const canvasHeight = 591;
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background putih
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Header hitam
    const headerHeight = 90;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, headerHeight);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '600 20px Montserrat';
    ctx.fillText('PROPERTY OF', canvasWidth / 2, 30);
    ctx.font = '600 20px Montserrat';
    ctx.fillText(asset.company ?? 'Company Name', canvasWidth / 2, 60);

    // Footer hitam
    const footerHeight = 90;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, canvasHeight - footerHeight, canvasWidth, footerHeight);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '600 16px Montserrat';
    ctx.fillText(asset.id ?? 'ID-0001', canvasWidth / 2, canvasHeight - footerHeight + 30);
    ctx.font = '400 14px Montserrat';
    ctx.fillText(asset.item_name ?? 'Item Name', canvasWidth / 2, canvasHeight - footerHeight + 55);

    // QR code
    const qrSize = 240;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = headerHeight + ((canvasHeight - headerHeight - footerHeight - qrSize) / 2);

    const sourceCanvas = document.getElementById(`qr-download-${asset.id}`) as HTMLCanvasElement;
    if (!sourceCanvas) return;

    ctx.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

    // Download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `QR-${(asset.item_name ?? 'item').replace(/[\\/:*?"<>|]/g, '-')}.png`;
    link.click();

    setDownloading(null);
  };

  return (
    <div className="grid gap-4">
      {assets.map((a) => (
        <div
          key={a.id}
          className="relative flex gap-4 border rounded-lg p-4 shadow-sm bg-white min-h-[150px]"
        >
          {/* QR Kiri */}
          <div className="shrink-0 flex flex-col items-center justify-start">
            <QRCodeCanvas value={a.qr_value} size={90} />
            <p className="text-xs text-gray-500 mt-1">{a.id}</p>
          </div>

          {/* Konten */}
          <div className="flex-1 pr-8">
            <p className="font-semibold text-base leading-tight">{a.item_name}</p>
            <p className="text-sm text-gray-700 leading-tight">{a.user_assigned}</p>
            <p className="text-sm text-gray-500 leading-tight">{a.brand} • {a.category}</p>
            <p className="text-sm text-gray-500 leading-tight">SN: {a.serial_number}</p>
            <p
              className={`text-sm font-medium leading-tight ${
                a.status === 'Active'
                  ? 'text-green-600'
                  : a.status === 'Broken'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              Status: {a.status}
            </p>
            <p className="text-sm text-gray-500 leading-tight">{a.location}</p>
          </div>

          {/* Aksi kanan bawah */}
          {(role === 'admin' || role === 'staff') && (
            <div className="absolute bottom-2 right-3 flex gap-3 bg-white">
              <button
                onClick={() => onEdit(a)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDownloadQR(a)}
                className="text-green-600 hover:text-green-800"
              >
                {downloading === a.id ? (
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={18} />
                )}
              </button>
            </div>
          )}

          {/* Hidden QR */}
          <QRCodeCanvas
            id={`qr-download-${a.id}`}
            value={a.qr_value}
            size={600}
            className="hidden"
          />
        </div>
      ))}
    </div>
  );
}
