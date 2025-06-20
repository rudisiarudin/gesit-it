'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Trash2, Pencil, Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';
import DownloadAllQRButton from '@/components/DownloadAllQRButton';
import { usePagination } from '@/hooks/usePagination';
import { useUserRole } from '@/hooks/useUserRole';

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
  company?: string;         // <- Tambah ini
  department?: string;      // <- Tambah ini
  qr_value: string;
  user_id?: string;
}


export default function ItAssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    company: '',          // <- Tambah ini
    department: '',       // <- Tambah ini
    user_id: ''
  });

  const router = useRouter();
  const { role, userId } = useUserRole();
  const itemsPerPage = 10;

 const generateId = async (category: string, company: string) => {
  const companyCode = company.toLowerCase().includes('gesit alumas') ? 'GA' :
    company.toLowerCase().includes('gesit perkasa') ? 'GP' :
    company.toLowerCase().includes('sircon') ? 'SI' :
    company.toLowerCase().includes('alakasa') ? 'AI' :
    company.toLowerCase().includes('gesit graha') ? 'GG' :
    company.toLowerCase().includes('gesit intrade') ? 'GI' :
    company.toLowerCase().includes('dharma') ? 'DAS' :
    company.toLowerCase().includes('dinamika') ? 'DSM' : 'XX';

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
    category.toLowerCase().includes('tools') ? 'TL' : 'OT';

  const { count } = await supabase
    .from('it_assets')
    .select('*', { count: 'exact', head: true })
    .eq('category', category)
    .eq('company', company); // pastikan kolom 'company' ada di table

  const serial = String((count || 0) + 1).padStart(3, '0');
  return `${companyCode}-${catCode}-${serial}`;
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
      .from('it_assets')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) setAssets(data);
  };

  const handleSubmit = async () => {
    if (!userId) return;

    const required = [
  'item_name', 'category', 'brand', 'serial_number',
  'status', 'location', 'user_assigned', 'company', 'department'
];

const isValid = required.every((key) => {
  const value = (form as Record<string, string>)[key];
  return value && value.trim() !== '';
});

if (!isValid) return alert('Please fill all required fields.');

if (isEditing && editId) {
  const qrValue = `${location.origin}/asset?id=${editId}`;
  const { error } = await supabase
    .from('it_assets')
    .update({ ...form, qr_value: qrValue })
    .eq('id', editId);

  if (error) {
    console.error('Update error:', error);
    return;
  }
} else {
 if (!form.category || !form.company) {
  alert('Category dan Company wajib diisi.');
  return;
}

const newId = await generateId(form.category, form.company);

  const qrValue = `${location.origin}/asset?id=${newId}`;
  const { error } = await supabase.from('it_assets').insert([{
    ...form,
    id: newId,
    qr_value: qrValue,
    user_id: userId
  }]);

  if (error) {
    console.error('Insert error:', error);
    return;
  }
}

setIsOpen(false);
setIsEditing(false);
setEditId(null);
resetForm();
fetchAssets();

  };

  const handleEdit = (asset: Asset) => {
    if (role === 'user') return;
    setForm(asset);
    setEditId(asset.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (role !== 'admin') return;
    if (!confirm('Delete this asset?')) return;
    const { error } = await supabase.from('it_assets').delete().eq('id', id);
    if (!error) fetchAssets();
  };

  const handleQRDownload = (asset: Asset) => {
    const canvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
    if (!canvas) return alert('QR code not found');
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${asset.item_name}-${asset.id}.png`;
    downloadLink.click();
  };

  const resetForm = () => {
    setForm({
  id: '', item_name: '', category: '', brand: '', serial_number: '', status: '',
  location: '', user_assigned: '', remarks: '', storage: '', ram: '', vga: '', processor: '', user_id: '',
  company: '', department: '' // ← tambahkan ini
});
  };

  const filteredAssets = assets.filter((a) =>
    [a.item_name, a.brand, a.serial_number].some(field =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const { currentPage, paginatedItems, nextPage, prevPage } =
    usePagination(filteredAssets.length, itemsPerPage);
  const displayedAssets = paginatedItems(filteredAssets);

  const isLaptopOrPC = form.category.toLowerCase().includes('laptop') || form.category.toLowerCase().includes('pc');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">IT Asset List</h1>
      </div>
      {/* Search, QR Download, Tambah */}
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
                resetForm();
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
              <th className="p-2">Brand</th>
              <th className="p-2">S/N</th>
              <th className="p-2">Status</th>
              <th className="p-2">Location</th>
              <th className="p-2">User</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedAssets.map((a, i) => (
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
                <td className="p-2 flex items-center gap-2">
                {(role === 'admin' || role === 'staff') && (
                  <>
                    <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={16} />
                    </button>
                    {role === 'admin' && (
                      <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}

                {/* Tombol download QR satuan */}
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
                    const safeName = a.item_name.replace(/[\\/:*?"<>|]/g, '-');
                    link.download = `QR-${safeName}.png`;
                    link.click();
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  <Download size={16} />
                </button>

                {/* Hidden QR canvas untuk download satuan */}
                <QRCodeCanvas id={`qr-download-${a.id}`} value={a.qr_value} size={1024} className="hidden" />

                {/* Hidden QR canvas untuk download massal */}
                <QRCodeCanvas id={`qr-${a.id}`} value={a.qr_value} size={1024} className="hidden" />
              </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Buttons */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm">
          Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length}
        </p>
        <div className="space-x-2">
          <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
          <button onClick={nextPage} disabled={currentPage * itemsPerPage >= filteredAssets.length} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <Dialog.Title className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Edit Asset' : 'Tambah Asset'}
        </Dialog.Title>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kolom kiri */}
          <div className="space-y-3">
            {/* Select Company */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Company</label>
              <select
                value={form.company || ''}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Pilih Company</option>
                <option value="Gesit Alumas">Gesit Alumas</option>
                <option value="Gesit Perkasa">Gesit Perkasa</option>
                <option value="Sircon Investment">Sircon Investment</option>
                <option value="Alakasa Industrindo">Alakasa Industrindo</option>
                <option value="Gesit Graha">Gesit Graha</option>
                <option value="Dharma Alumas Sakti">Dharma Alumas Sakti</option>
                <option value="Dinamika Sejahtera Mandiri">Dinamika Sejahtera Mandiri</option>
                <option value="Gesit Intrade">Gesit Intrade</option>
              </select>
            </div>

            {/* Input kiri */}
            {[
              { label: 'Item Name', key: 'item_name' },
              { label: 'Brand', key: 'brand' },
              { label: 'Serial Number', key: 'serial_number' },
              { label: 'Status', key: 'status' }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Kolom kanan */}
          <div className="space-y-3">
            {/* Select Category */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <select
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Pilih Kategori</option>
                <option value="Laptop">Laptop</option>
                <option value="PC">PC</option>
                <option value="Printer">Printer</option>
                <option value="Monitor">Monitor</option>
                <option value="Proyektor">Proyektor</option>
                <option value="Router">Router</option>
                <option value="Harddisk">Harddisk</option>
                <option value="Switch">Switch</option>
                <option value="Access Point">Access Point</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Security">Security</option>
                <option value="Tools">Tools</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Input kanan */}
            {[
              { label: 'Location', key: 'location' },
              { label: 'User Assigned', key: 'user_assigned' },
              { label: 'Remarks', key: 'remarks' },
              { label: 'Department', key: 'department' }
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Optional fields jika Laptop/PC */}
        {isLaptopOrPC && (
          <>
            <hr className="my-6 border-gray-300" />
            <h3 className="text-base font-medium text-gray-800 mb-2">Spesifikasi Tambahan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Storage', key: 'storage' },
                { label: 'RAM', key: 'ram' },
                { label: 'VGA', key: 'vga' },
                { label: 'Processor', key: 'processor' }
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(form as Record<string, string>)[key] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tombol Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition"
          >
            {isEditing ? 'Update Asset' : 'Tambah Asset'}
          </button>
        </div>
      </form>
    </Dialog.Panel>
  </div>
</Dialog>


    </div>
  );
}
