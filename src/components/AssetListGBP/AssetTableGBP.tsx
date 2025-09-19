'use client';

import { Pencil, Trash2, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { AssetGBP } from './AssetFormModalGBP';

interface Props {
  assets: AssetGBP[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (asset: AssetGBP) => void;
  onDelete: (id: string) => Promise<void>;
  role: string;
}

export default function AssetTableGBP({
  assets,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  role,
}: Props) {
  const confirmDelete = (asset: AssetGBP) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-2 bg-white p-4 rounded shadow max-w-sm">
        <p className="font-medium text-sm">
          Hapus asset <b>{asset.item_name}</b> ({asset.id})?
        </p>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              try {
                await onDelete(asset.id!);
                toast.success('Asset berhasil dihapus');
              } catch {
                toast.error('Gagal menghapus asset');
              } finally {
                toast.dismiss(t);
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    ));
  };

  const downloadQR = async (a: AssetGBP) => {
    const sourceCanvas = document.getElementById(`qr-${a.id}`) as HTMLCanvasElement | null;
    if (!sourceCanvas) {
      toast.error('QR Code tidak ditemukan');
      return;
    }

    const W = 354;   // ~30mm @300dpi
    const H = 591;   // ~50mm @300dpi
    const headerH = 90;
    const footerH = 110;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // background putih
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    // header hitam + nama perusahaan
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, headerH);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('PROPERTY OF', W / 2, 30);
    ctx.font = '700 20px sans-serif';
    ctx.fillText(a.company || 'PT GESIT BUMI PERSADA', W / 2, 58); // ✅ aman krn tipe sudah punya company

    // footer
    ctx.fillStyle = '#000';
    ctx.fillRect(0, H - footerH, W, footerH);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '700 16px sans-serif';
    ctx.fillText(a.id ?? 'ID-000', W / 2, H - footerH + 34);
    ctx.font = '500 14px sans-serif';
    ctx.fillText(a.item_name ?? 'Item', W / 2, H - footerH + 60);

    // QR
    const qrSize = 260;
    const qrX = (W - qrSize) / 2;
    const bodyHeight = H - headerH - footerH;
    const qrY = headerH + (bodyHeight - qrSize) / 2;
    ctx.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

    // download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    const safeName = (a.item_name || a.id || 'asset').replace(/[\\/:*?"<>|]/g, '-');
    link.download = `QR-${safeName}.png`;
    link.click();
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-xs border-collapse">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">No</th>
            <th className="p-2 text-left max-w-[150px] truncate">Item</th>
            <th className="p-2 text-left max-w-[120px] truncate">Category</th>
            <th className="p-2 text-left">Brand</th>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left max-w-[120px] truncate">Location</th>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Condition</th>
            <th className="p-2 text-left">Purchase Date</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a, i) => (
            <tr key={a.id} className="border-t">
              <td className="p-2">{(currentPage - 1) * itemsPerPage + i + 1}</td>
              <td className="p-2 max-w-[150px] truncate">{a.item_name}</td>
              <td className="p-2 max-w-[120px] truncate">{a.category}</td>
              <td className="p-2">{a.brand || '-'}</td>
              <td className="p-2">{a.id}</td>
              <td className="p-2">{a.status}</td>
              <td className="p-2 max-w-[120px] truncate">{a.location}</td>
              <td className="p-2">{a.user_assigned || '-'}</td>
              <td className="p-2">{a.remarks || '-'}</td>
              <td className="p-2">
                {a.purchase_date ? format(new Date(a.purchase_date), 'dd-MM-yyyy') : '-'}
              </td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  {(role === 'admin' || role === 'staff') && (
                    <button
                      onClick={() => onEdit(a)}
                      title="Edit"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {role === 'admin' && (
                    <button
                      onClick={() => confirmDelete(a)}
                      title="Delete"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => downloadQR(a)}
                    title="Download QR (PNG)"
                    className="text-green-600 hover:text-green-800"
                  >
                    <Download size={14} />
                  </button>
                </div>

                {/* Hidden QR for drawImage */}
                <QRCodeCanvas
                  id={`qr-${a.id}`}
                  value={a.qr_value || ''}
                  size={512}
                  className="hidden"
                />
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={11}>
                No data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
