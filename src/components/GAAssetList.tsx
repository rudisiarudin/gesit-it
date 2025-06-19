
'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Trash2, Pencil, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import DownloadAllQRButton from '@/components/DownloadAllQRButton';
import { usePagination } from '@/hooks/usePagination';
import { useUserRole } from '@/hooks/useUserRole';

interface GAAsset {
  id: string;
  item_name: string;
  category: string;
  brand: string;
  serial_number: string;
  status: string;
  location: string;
  user_assigned: string;
  remarks: string;
  qr_value: string;
  user_id?: string;
}

export default function GAAssetList() {
  const [assets, setAssets] = useState<GAAsset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<Omit<GAAsset, 'qr_value'>>({
    id: '', item_name: '', category: '', brand: '', serial_number: '', status: '', location: '', user_assigned: '', remarks: '', user_id: ''
  });

  const router = useRouter();
  const { role, userId } = useUserRole();

  const generateId = async (category: string) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(2);
    const prefix = 'GA';
    const catCode = category.split(' ')[0].toUpperCase().slice(0, 2);

    const { count } = await supabase
      .from('ga_assets')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);

    const serial = String((count || 0) + 1).padStart(3, '0');
    return `${prefix}-${dd}${mm}${yy}-${catCode}-${serial}`;
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else fetchAssets();
    };

    checkSession();
  }, []);

  const fetchAssets = async () => {
    const { data, error } = await supabase
      .from('ga_assets')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) setAssets(data);
  };

  const handleSubmit = async () => {
    if (!userId) return;

    const required = ['item_name', 'category', 'status', 'location'];
    const isValid = required.every(key => (form as any)[key]?.trim() !== '');
    if (!isValid) return alert('Please fill all required fields.');

    const qrValue = `${location.origin}/ga-asset?id=${isEditing ? editId : form.id}`;

    if (isEditing && editId) {
      const { error } = await supabase
        .from('ga_assets')
        .update({ ...form, qr_value: qrValue })
        .eq('id', editId);
      if (error) console.error('Update error:', error);
    } else {
      const newId = await generateId(form.category);
      const { error } = await supabase.from('ga_assets').insert([{
        ...form,
        id: newId,
        qr_value: qrValue,
        user_id: userId
      }]);
      if (error) console.error('Insert error:', error);
    }

    setIsOpen(false);
    setIsEditing(false);
    setEditId(null);
    setForm({
      id: '',
      item_name: '',
      category: '',
      brand: '',
      serial_number: '',
      status: '',
      location: '',
      user_assigned: '',
      remarks: '',
      user_id: '',
    });
    fetchAssets();
  };

  const handleEdit = (asset: GAAsset) => {
    if (role === 'user') return;
    setForm(asset);
    setEditId(asset.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (role !== 'admin') return;
    if (!confirm('Delete this asset?')) return;
    const { error } = await supabase.from('ga_assets').delete().eq('id', id);
    if (!error) fetchAssets();
  };

  const filteredAssets = assets.filter((a) =>
    [a.item_name, a.category, a.location].some(field =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const { currentPage, totalPages, paginatedItems, nextPage, prevPage } = usePagination(filteredAssets.length, 10);
  const displayedAssets = paginatedItems(filteredAssets);
  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">GA Asset List</h1>
      </div>

      {/* Search + Download All QR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search item, brand, SN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-1/3"
        />
      
        <div className="flex gap-2">
          <DownloadAllQRButton assets={displayedAssets} />
          {(role === 'admin' || role === 'staff') && (
            <button
              onClick={() => {
                setIsOpen(true);
                setIsEditing(false);
                setEditId(null);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              <PlusCircle size={18} className="inline mr-1" /> Asset
            </button>
          )}
        </div>
        
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">No</th>
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
            {displayedAssets.map((a, i) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{(currentPage - 1) * 10 + i + 1}</td>
                <td className="p-2">{a.item_name}</td>
                <td className="p-2">{a.id}</td>
                <td className="p-2">{a.category}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.location}</td>
                <td className="p-2">{a.user_assigned}</td>
                <td className="p-2 flex gap-2 items-center">
                  {(role === 'admin' || role === 'staff') && (
                    <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={16} />
                    </button>
                  )}
                  {role === 'admin' && (
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  )}
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

                      ctx.fillStyle = '#ffffff';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);

                      ctx.strokeStyle = '#000000';
                      ctx.lineWidth = 4;
                      ctx.strokeRect(0, 0, canvas.width, canvas.height);

                      ctx.drawImage(sourceCanvas, padding, padding, qrSize, qrSize);

                      ctx.fillStyle = '#000000';
                      ctx.textAlign = 'center';

                      ctx.font = 'bold 48px Arial';
                      ctx.fillText(a.item_name, canvas.width / 2, qrSize + padding + 70);

                      ctx.font = '36px Arial';
                      ctx.fillText(`ID: ${a.id}`, canvas.width / 2, qrSize + padding + 120);

                      const link = document.createElement('a');
                      link.href = canvas.toDataURL('image/png');
                      link.download = `QR-${a.item_name}.png`;
                      link.click();
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Download size={16} />
                    <div className="hidden">
                      <QRCodeCanvas id={`qr-download-${a.id}`} value={a.qr_value} size={1024} />
                    </div>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm">
          Showing {(currentPage - 1) * 10 + 1}–
          {Math.min(currentPage * 10, filteredAssets.length)} of {filteredAssets.length}
        </p>
        <div className="space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage * 10 >= filteredAssets.length}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <Dialog.Title className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Edit GA Asset' : 'Add GA Asset'}
        </Dialog.Title>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'item_name', label: 'Item Name' },
            { key: 'brand', label: 'Brand' },
            { key: 'serial_number', label: 'Serial Number' },
            { key: 'status', label: 'Status' },
            { key: 'location', label: 'Location' },
            { key: 'user_assigned', label: 'User Assigned' },
            { key: 'remarks', label: 'Remarks' }
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-600 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Category --</option>
              <option value="Meja">Meja</option>
              <option value="Kursi">Kursi</option>
              <option value="Lemari">Lemari</option>
              <option value="Alat Kebersihan">Alat Kebersihan</option>
              <option value="Perlengkapan Dapur">Perlengkapan Dapur</option>
              <option value="AC / Kipas">AC / Kipas</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Dialog.Panel>
  </div>
</Dialog>

    </div>
  );
}
