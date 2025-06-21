'use client';

import { Download, Pencil, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { GAAsset } from './types';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

type Props = {
  assets: GAAsset[];
  currentPage: number;
  searchTerm: string;
  onEdit: (a: GAAsset) => void;
  onDelete: (id: string) => void;
  role: string;
};

export default function GAAssetTable({
  assets,
  currentPage,
  searchTerm,
  onEdit,
  onDelete,
  role,
}: Props) {
  const qrRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleDownloadQR = async (asset: GAAsset) => {
    const target = qrRefs.current[asset.id];
    if (!target) return alert('QR not ready');

    const canvas = await html2canvas(target, { backgroundColor: '#fff' });
    canvas.toBlob((blob) => {
      if (blob) {
        const safeName = asset.item_name.replace(/[<>:"/\\|?*]+/g, '-');
        saveAs(blob, `QR-${safeName}-${asset.id}.png`);
      }
    });
  };

  return (
    <div className="overflow-auto">
      <table className="w-full bg-white shadow rounded text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">No</th>
            <th className="p-2">Image</th>
            <th className="p-2">Item</th>
            <th className="p-2">Asset ID</th>
            <th className="p-2">Category</th>
            <th className="p-2">Status</th>
            <th className="p-2">Location</th>
            <th className="p-2">User</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center p-4 text-gray-500">
                No assets found.
              </td>
            </tr>
          ) : (
            assets.map((a, i) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{(currentPage - 1) * 10 + i + 1}</td>
                <td className="p-2">
                  {a.image_url && (
                    <img
                      src={a.image_url}
                      alt="asset"
                      className="h-12 w-12 object-cover rounded border"
                    />
                  )}
                </td>
                <td className="p-2">{a.item_name}</td>
                <td className="p-2">{a.id}</td>
                <td className="p-2">{a.category}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.location}</td>
                <td className="p-2">{a.user_assigned}</td>
                <td className="p-2 flex gap-2 items-center">
                  <button
                    onClick={() => handleDownloadQR(a)}
                    className="text-green-600 hover:text-green-800"
                    title="Download QR"
                  >
                    <Download size={16} />
                  </button>

                  {(role === 'admin' || role === 'staff') && (
                    <button
                      onClick={() => onEdit(a)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {role === 'admin' && (
                    <button
                      onClick={() => onDelete(a.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  {/* Hidden QR DOM */}
                  <div
                    ref={(el) => {
                      qrRefs.current[a.id] = el;
                    }}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      backgroundColor: '#fff',
                      padding: '40px',
                      textAlign: 'center',
                    }}
                  >
                    <QRCodeCanvas value={a.qr_value} size={256} />
                    <div style={{ marginTop: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                      {a.item_name}
                    </div>
                    <div style={{ fontSize: '14px' }}>ID: {a.id}</div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
