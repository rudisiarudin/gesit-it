'use client';

import { Pencil, Trash2, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';
import { GAAsset } from '@/components/types';

interface Props {
  assets: GAAsset[];
  currentPage: number;
  searchTerm: string;
  onEdit: (asset: GAAsset) => void;
  onDelete: (asset: GAAsset) => void;
  role: string;
}

export default function GAAssetTable({
  assets,
  currentPage,
  searchTerm,
  onEdit,
  onDelete,
  role,
}: Props) {
  const itemsPerPage = 10;

  const handleDownloadQR = (asset: GAAsset) => {
    const sourceCanvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
    if (!sourceCanvas) return;

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
    ctx.fillText(asset.item_name, canvas.width / 2, qrSize + padding + 70);

    ctx.font = '36px Arial';
    ctx.fillText(`ID: ${asset.id}`, canvas.width / 2, qrSize + padding + 120);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `QR-${asset.item_name.replace(/[\\/:*?"<>|]/g, '-')}.png`;
    link.click();
  };

  return (
    <div className="overflow-auto">
      <table className="w-full bg-white shadow rounded text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2">No</th>
            <th className="p-2">Item</th>
            <th className="p-2">Category</th>
            <th className="p-2">Brand</th>
            <th className="p-2">ID</th>
            <th className="p-2">Status</th>
            <th className="p-2">Location</th>
            <th className="p-2">User</th>
            <th className="p-2">Condition</th>
            <th className="p-2">Purchase Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-4 text-gray-500">
                No assets found.
              </td>
            </tr>
          ) : (
            assets.map((asset, index) => (
              <tr key={asset.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="p-2">{asset.item_name}</td>
                <td className="p-2">{asset.category}</td>
                <td className="p-2">{asset.brand}</td>
                <td className="p-2">{asset.id}</td>
                <td className="p-2">{asset.status}</td>
                <td className="p-2">{asset.location}</td>
                <td className="p-2">{asset.user_assigned}</td>
                <td className="p-2">{asset.condition}</td>
                <td className="p-2">
                  {asset.purchase_date
                    ? format(new Date(asset.purchase_date), 'dd-MM-yyyy')
                    : '-'}
                </td>
                <td className="p-2 flex gap-2 items-center">
                  {(role === 'admin' || role === 'staff') && (
                    <>
                      <button
                        onClick={() => onEdit(asset)}
                        title="Edit"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={16} />
                      </button>
                      {role === 'admin' && (
                        <button
                          onClick={() => onDelete(asset)}
                          title="Delete"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => handleDownloadQR(asset)}
                    className="text-green-600 hover:text-green-800"
                    title="Download QR"
                  >
                    <Download size={16} />
                  </button>

                  <QRCodeCanvas
                    id={`qr-${asset.id}`}
                    value={asset.qr_value || asset.id}
                    size={1024}
                    className="hidden"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
