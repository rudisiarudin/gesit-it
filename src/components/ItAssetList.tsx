'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';

interface Asset {
  id: string;
  item_name: string;
  category: string;
  brand: string;
  serial_number: string;
  status: string;
  location: string;
  user_assigned: string;
  remarks: string;
  storage?: string;
  ram?: string;
  vga?: string;
  processor?: string;
  qr_value: string;
  user_id?: string;
}

export default function ItAssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Asset, 'qr_value'>>({
    id: '',
    item_name: '',
    category: '',
    brand: '',
    serial_number: '',
    status: '',
    location: '',
    user_assigned: '',
    remarks: '',
    storage: '',
    ram: '',
    vga: '',
    processor: '',
    user_id: '',
  });

  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const generateId = async (category: string) => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(2);
  const prefix = 'IT';

  const catCode =
    category.toLowerCase().includes('laptop') ? 'LP' :
    category.toLowerCase().includes('pc') ? 'PC' :
    category.toLowerCase().includes('printer') ? 'PR' :
    category.toLowerCase().includes('monitor') ? 'MN' :
    category.toLowerCase().includes('proyektor') ? 'PJ' :
    category.toLowerCase().includes('router') ? 'RT' :
    category.toLowerCase().includes('harddisk') ? 'HD' :
    category.toLowerCase().includes('switch') ? 'SW' :
    category.toLowerCase().includes('access') ? 'AP' :
    category.toLowerCase().includes('peripherals') ? 'PH' :
    category.toLowerCase().includes('security') ? 'SC' :
    category.toLowerCase().includes('tools') ? 'TL' :
    'OT';

  const { count } = await supabase
    .from('it_assets')
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
      .from('it_assets')
      .select('*')
      .eq('user_id', uid)
      .order('id', { ascending: true });

    if (!error && data) setAssets(data);
    else console.error('Error fetching assets:', error);
  };

  const handleSubmit = async () => {
    if (!userId) return;

    const requiredKeys = ['item_name', 'category', 'brand', 'serial_number', 'status', 'location', 'user_assigned'];
    const isFormValid = requiredKeys.every((key) => String((form as any)[key]).trim() !== '');

    if (!isFormValid) return alert('Please fill all required fields.');

    const isLaptopOrPC = ['laptop', 'pc'].includes(form.category.toLowerCase());

    if (isEditing && editId) {
      const qrValue = `${location.origin}/asset?id=${editId}`;
      const { error } = await supabase
        .from('it_assets')
        .update({ ...form, qr_value: qrValue })
        .eq('id', editId);
      if (error) console.error('Update error:', error);
    } else {
      const newId = await generateId(form.category);
      const qrValue = `${location.origin}/asset?id=${newId}`;
      const { error } = await supabase.from('it_assets').insert([{
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
      storage: '',
      ram: '',
      vga: '',
      processor: '',
      user_id: '',
    });
    fetchAssets(userId);
  };

  const handleEdit = (asset: Asset) => {
    setForm(asset);
    setEditId(asset.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    const { error } = await supabase.from('it_assets').delete().eq('id', id);
    if (!error && userId) fetchAssets(userId);
  };

  const isLaptopOrPC = ['laptop', 'pc'].includes(form.category.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">IT Asset List</h1>
        <button
          onClick={() => {
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
              storage: '',
              ram: '',
              vga: '',
              processor: '',
              user_id: '',
            });
            setIsEditing(false);
            setEditId(null);
            setIsOpen(true);
          }}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <PlusCircle className="mr-2" size={18} /> Add Asset
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">No</th>
              <th className="p-2">Item</th>
              <th className="p-2">QR</th>
              <th className="p-2">Category</th>
              <th className="p-2">Brand</th>
              <th className="p-2">S/N</th>
              <th className="p-2">Status</th>
              <th className="p-2">Location</th>
              <th className="p-2">User</th>
              <th className="p-2">Remarks</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, idx) => (
              <tr key={asset.id} className="border-t">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{asset.item_name}</td>
                <td className="p-2">
                  {asset.qr_value && (
                    <div className="flex flex-col items-center">
                      <QRCodeCanvas id={`qr-${asset.id}`} value={asset.qr_value} size={64} />
                      <button
                        className="text-xs text-blue-600 underline mt-1"
                        onClick={() => {
                          const canvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
                          const url = canvas.toDataURL("image/png");
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `QR-${asset.item_name}.png`;
                          link.click();
                        }}
                      >
                        Download
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-2">{asset.category}</td>
                <td className="p-2">{asset.brand}</td>
                <td className="p-2">{asset.serial_number}</td>
                <td className="p-2">{asset.status}</td>
                <td className="p-2">{asset.location}</td>
                <td className="p-2">{asset.user_assigned}</td>
                <td className="p-2">{asset.remarks}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => handleEdit(asset)} className="text-blue-600 hover:underline">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:underline">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white w-full max-w-xl p-6 rounded shadow">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isEditing ? 'Edit Asset' : 'Add Asset'}
            </Dialog.Title>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'item_name', label: 'Item Name' },
                { key: 'brand', label: 'Brand' },
                { key: 'serial_number', label: 'Serial Number' },
                { key: 'status', label: 'Status' },
                { key: 'location', label: 'Location' },
                { key: 'user_assigned', label: 'User Assigned' },
                { key: 'remarks', label: 'Remarks' },
              ].map(({ key, label }) => (
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
                <option value="Laptop">Laptop</option>
                <option value="PC">PC</option>
                <option value="Printer">Printer</option>
                <option value="Monitor">Monitor</option>
                <option value="Proyektor">Proyektor</option>
                <option value="Router / Modem">Router / Modem</option>
                <option value="Harddisk Eksternal / SSD">Harddisk Eksternal / SSD</option>
                <option value="Switch / Hub">Switch / Hub</option>
                <option value="Access Point">Access Point</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Security">Security</option>
                <option value="Tools">Tools</option>
                <option value="Others">Others</option>
                </select>


              {isLaptopOrPC && (
                <>
                  {['processor', 'storage', 'ram', 'vga'].map((key) => (
                    <input
                      key={key}
                      type="text"
                      placeholder={key.toUpperCase()}
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border p-2 rounded"
                    />
                  ))}
                </>
              )}
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
 