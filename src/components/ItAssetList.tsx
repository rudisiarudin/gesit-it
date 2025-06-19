'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';


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
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by item name, brand, or serial number..."
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
            {assets
              .filter((asset) => {
                const term = searchTerm.toLowerCase();
                return (
                  asset.item_name.toLowerCase().includes(term) ||
                  asset.brand.toLowerCase().includes(term) ||
                  asset.serial_number.toLowerCase().includes(term)
                );
              })
              .map((asset, idx) => (
                <tr key={asset.id} className="border-t">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{asset.item_name}</td>
                  <td className="p-2">{asset.id}</td>
                  <td className="p-2">{asset.category}</td>
                  <td className="p-2">{asset.brand}</td>
                  <td className="p-2">{asset.serial_number}</td>
                  <td className="p-2">{asset.status}</td>
                  <td className="p-2">{asset.location}</td>
                  <td className="p-2">{asset.user_assigned}</td>
                  <td className="p-2">{asset.remarks}</td>
                  <td className="p-2 flex gap-2 items-center">
  <button
    onClick={() => handleEdit(asset)}
    className="text-blue-600 hover:text-blue-800"
    title="Edit"
  >
    <Pencil size={16} />
  </button>

  <button
    onClick={() => handleDelete(asset.id)}
    className="text-red-600 hover:text-red-800"
    title="Delete"
  >
    <Trash2 size={16} />
  </button>

  <button
    onClick={() => {
      const sourceCanvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
      if (!sourceCanvas) return alert('QR Code not found');

      const qrSize = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = qrSize;
      canvas.height = qrSize + 120;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sourceCanvas, 0, 0, qrSize, qrSize);

      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(`Gesit Asset - ${asset.item_name}`, canvas.width / 2, qrSize + 60);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `QR-GesitAsset-${asset.item_name}.png`;
      link.click();
    }}
    className="text-green-600 hover:text-green-800"
    title="Download QR"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </svg>
  </button>
</td>

                </tr>
              ))}
          </tbody>
        </table>
      </div>

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
