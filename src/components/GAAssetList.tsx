'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Trash2, Pencil, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { useRouter } from 'next/navigation';

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
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const [form, setForm] = useState<Omit<GAAsset, 'qr_value'>>({
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
      if (!session) {
        router.replace('/login');
      } else {
        const uid = session.user.id;
        setUserId(uid);
        fetchAssets(uid);
      }
    };

    checkSession();
  }, []);

  const fetchAssets = async (uid: string) => {
    const { data, error } = await supabase
      .from('ga_assets')
      .select('*')
      .eq('user_id', uid)
      .order('id', { ascending: true });

    if (!error && data) setAssets(data);
    else console.error('Fetch error:', error);
  };

  const handleSubmit = async () => {
    if (!userId) return;

    const required = ['item_name', 'category', 'status', 'location'];
    const isValid = required.every(key => (form as any)[key]?.trim() !== '');

    if (!isValid) return alert('Please fill all required fields.');

    if (isEditing && editId) {
      const qrValue = `${location.origin}/ga-asset?id=${editId}`;
      const { error } = await supabase
        .from('ga_assets')
        .update({ ...form, qr_value: qrValue })
        .eq('id', editId);
      if (error) console.error('Update error:', error.message);
    } else {
      const newId = await generateId(form.category);
      const qrValue = `${location.origin}/ga-asset?id=${newId}`;
      const { error } = await supabase.from('ga_assets').insert([{
        ...form,
        id: newId,
        qr_value: qrValue,
        user_id: userId
      }]);
      if (error) console.error('Insert error:', error.message);
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
    fetchAssets(userId);
  };

  const handleEdit = (asset: GAAsset) => {
    setForm(asset);
    setEditId(asset.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    const { error } = await supabase.from('ga_assets').delete().eq('id', id);
    if (!error && userId) fetchAssets(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">GA Asset List</h1>
        <button
          onClick={() => {
            setIsEditing(false);
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
            setIsOpen(true);
          }}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <PlusCircle className="mr-2" size={18} /> Add GA Asset
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search item, category, location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-1/3"
        />
      </div>

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
            {assets
              .filter((a) =>
                [a.item_name, a.category, a.location].some(field =>
                  field.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((a, i) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{a.item_name}</td>
                  <td className="p-2">{a.id}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2">{a.status}</td>
                  <td className="p-2">{a.location}</td>
                  <td className="p-2">{a.user_assigned}</td>
                  <td className="p-2 flex gap-2 items-center">
                    <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        const canvas = document.createElement('canvas');
                        const qrCanvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const size = 1024;
                        canvas.width = size;
                        canvas.height = size + 100;

                        if (!ctx) return;

                        const text = `GA - ${a.item_name}`;
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        QRCodeCanvas.render({ value: a.qr_value, size }, qrCanvas);
                        ctx.drawImage(qrCanvas, 0, 0);

                        ctx.fillStyle = 'black';
                        ctx.textAlign = 'center';
                        ctx.font = 'bold 40px Arial';
                        ctx.fillText(text, canvas.width / 2, size + 60);

                        const link = document.createElement('a');
                        link.href = canvas.toDataURL('image/png');
                        link.download = `QR-${a.item_name}.png`;
                        link.click();
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Dialog form tetap sama */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white w-full max-w-xl p-6 rounded shadow">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isEditing ? 'Edit GA Asset' : 'Add GA Asset'}
            </Dialog.Title>

            <div className="grid grid-cols-2 gap-4">
              {[{ key: 'item_name', label: 'Item Name' }, { key: 'brand', label: 'Brand' }, { key: 'serial_number', label: 'Serial Number' }, { key: 'status', label: 'Status' }, { key: 'location', label: 'Location' }, { key: 'user_assigned', label: 'User Assigned' }, { key: 'remarks', label: 'Remarks' }]
                .map(({ key, label }) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={label}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                ))}

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border p-2 rounded"
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

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {isEditing ? 'Update' : 'Add'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
