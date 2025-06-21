'use client';

import { Pencil, Trash2, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';
import { Asset } from '@/app/dashboard/it-assets/page';

interface Props {
  assets: Asset[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  role: string;
}

export default function ITAssetTable({
  assets,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  role,
}: Props) {
  return (
    <div className="overflow-auto">
      <table className="w-full bg-white shadow rounded text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">No</th>
            <th className="p-2">Item</th>
            <th className="p-2">Asset ID</th>
            <th className="p-2">Category</th>
            <th className="p-2">Brand</th>
            <th className="p-2">S/N</th>
            <th className="p-2">Status</th>
            <th className="p-2">Location</th>
            <th className="p-2">User</th>
            <th className="p-2">Purchase Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a, i) => (
            <tr key={a.id} className="border-t">
              <td className="p-2">{(currentPage - 1) * itemsPerPage + i + 1}</td>
              <td className="p-2">{a.item_name}</td>
              <td className="p-2">{a.id}</td>
              <td className="p-2">{a.category}</td>
              <td className="p-2">{a.brand}</td>
              <td className="p-2">{a.serial_number}</td>
              <td className="p-2">{a.status}</td>
              <td className="p-2">{a.location}</td>
              <td className="p-2">{a.user_assigned}</td>
              <td className="p-2">
                {a.purchase_date
                  ? format(new Date(a.purchase_date), 'dd-MM-yyyy')
                  : '-'}
              </td>
              <td className="p-2 flex items-center gap-2">
                {(role === 'admin' || role === 'staff') && (
                  <>
                    <button
                      onClick={() => onEdit(a)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                    {role === 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this asset?')) onDelete(a.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}

                {/* Tombol QR download satuan */}
                <button
                  onClick={() => {
                    const sourceCanvas = document.getElementById(`qr-download-${a.id}`) as HTMLCanvasElement;
                    if (!sourceCanvas) return alert('QR Code not found');

                    const qrSize = 1024;
                    const labelHeight = 160;
                    const padding = 40;
                    const canvas = document.createElement('canvas');
                    canvas.width = qrSize + padding * 2;
                    canvas.height = qrSize + labelHeight + padding * 2;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;

                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 4;
                    ctx.strokeRect(0, 0, canvas.width, canvas.height);

                    ctx.drawImage(sourceCanvas, padding, padding, qrSize, qrSize);

                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'center';

                    ctx.font = 'bold 48px Arial';
                    ctx.fillText(a.item_name, canvas.width / 2, qrSize + padding + 70);

                    ctx.font = '36px Arial';
                    ctx.fillText(`ID: ${a.id}`, canvas.width / 2, qrSize + padding + 120);

                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `QR-${a.item_name.replace(/[\\/:*?"<>|]/g, '-')}.png`;
                    link.click();
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  <Download size={16} />
                </button>

                {/* Hidden QR canvases */}
                <QRCodeCanvas id={`qr-download-${a.id}`} value={a.qr_value} size={1024} className="hidden" />
                <QRCodeCanvas id={`qr-${a.id}`} value={a.qr_value} size={1024} className="hidden" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
