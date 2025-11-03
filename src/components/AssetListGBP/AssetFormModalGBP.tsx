'use client';

import { Dialog } from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';

export interface AssetGBP {
  id?: string;                 // = asset_id
  asset_id?: string;           // disamakan dengan id
  item_name: string;
  category: string;
  brand?: string | null;
  serial_number?: string | null;
  status: string;
  location: string;
  user_assigned?: string | null;
  department?: string | null;
  purchase_date?: string | null; // yyyy-mm-dd
  remarks?: string | null;
  // spesifikasi opsional
  processor?: string | null;
  ram?: string | null;
  storage?: string | null;
  vga?: string | null;
  // qr
  qr_value?: string | null;
  // audit
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  editId: string | null;       // berisi id (kode)
  form: AssetGBP;
  setForm: (form: AssetGBP) => void;
  userId: string | null;
  fetchAssets: () => Promise<void> | void;
}

const statusOptions = ['Active', 'In Use', 'Spare', 'Broken', 'Disposed'];

const categoryOptions: { value: string; label: string; code: string }[] = [
  { value: 'Office Equipment', label: 'Office Equipment (Peralatan Kantor)', code: 'OFE' },
  { value: 'Office Furniture', label: 'Office Furniture (Perabot Kantor)', code: 'OFF' },
  { value: 'Electronic', label: 'Electronic', code: 'ELC' },
  { value: 'Laptop', label: 'Laptop', code: 'LP' },
  { value: 'Computer', label: 'Computer', code: 'PC' },
  { value: 'Printer', label: 'Printer', code: 'PRT' },
  { value: 'IT Asset', label: 'IT Asset (Peralatan IT & Jaringan)', code: 'ITA' },
  { value: 'Monitor', label: 'Monitor', code: 'MN' },
];

// generate id/asset_id: GBP-<CAT>-NNN
async function generateAssetCode(category: string) {
  const cat = categoryOptions.find((c) => c.value.toLowerCase() === (category || '').toLowerCase());
  const catCode = cat ? cat.code : 'OT';
  const prefix = `GNR-${catCode}-`;

  const { data, error } = await supabase
    .from('asset_gbp')
    .select('id')
    .like('id', `${prefix}%`);

  if (error) throw new Error('Gagal ambil nomor urut');

  const usedNumbers = (data || [])
    .map((r: any) => {
      const last = String(r.id || '').split('-').pop();
      return last ? parseInt(last, 10) : NaN;
    })
    .filter((n) => Number.isFinite(n));

  let next = 1;
  while (usedNumbers.includes(next)) next++;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

// ---- FIX: return selalu string | null, cocok utk semua field optional string
const toNull = (v: unknown): string | null => {
  if (typeof v === 'string') return v.trim() === '' ? null : v;
  if (v === undefined || v === null) return null;
  return String(v);
};

export default function AssetFormModalGBP({
  isOpen,
  onClose,
  isEditing,
  editId,
  form,
  setForm,
  userId,
  fetchAssets,
}: Props) {
  const [saving, setSaving] = useState(false);

  const update = (key: keyof AssetGBP, val: any) =>
    setForm({ ...(form as any), [key]: val } as AssetGBP);

  const requiredOk = useMemo(() => {
    const req: (keyof AssetGBP)[] = ['item_name', 'category', 'status', 'location'];
    return req.every((k) => String((form as any)[k] ?? '').trim() !== '');
  }, [form]);

  const isLaptopOrPC =
    form.category?.toLowerCase().includes('laptop') ||
    form.category?.toLowerCase().includes('pc') ||
    form.category?.toLowerCase().includes('computer');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!userId) return toast.error('User tidak ditemukan');
    if (!requiredOk) return toast.error('Harap lengkapi field wajib');

    try {
      setSaving(true);

      let code = form.id || form.asset_id;
      if (!isEditing || !code) {
        code = await generateAssetCode(form.category || '');
      }

      const id = code!;
      const asset_id = code!;

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const qr_value = `${origin}/asset-gbp?asset_id=${asset_id}`;

      const payload: AssetGBP = {
        id,
        asset_id,
        item_name: form.item_name,
        category: form.category,
        status: form.status,
        location: form.location,
        brand: toNull(form.brand),
        serial_number: toNull(form.serial_number),
        user_assigned: toNull(form.user_assigned),
        department: toNull(form.department),
        purchase_date: toNull(form.purchase_date),
        remarks: toNull(form.remarks),
        processor: toNull(form.processor),
        ram: toNull(form.ram),
        storage: toNull(form.storage),
        vga: toNull(form.vga),
        qr_value,
      };

      if (isEditing && editId) {
        const { error } = await supabase
          .from('asset_gbp')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
            updated_by: userId,
          })
          .eq('id', editId);
        if (error) throw error;
        toast.success('Asset berhasil diperbarui');
      } else {
        const { error } = await supabase.from('asset_gbp').insert({
          ...payload,
          created_at: new Date().toISOString(),
          created_by: userId,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        });
        if (error) throw error;
        toast.success('Asset berhasil ditambahkan');
      }

      await Promise.resolve(fetchAssets());
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-4 md:p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3">
            <Dialog.Title className="text-lg md:text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Asset (GNR)' : 'Tambah Asset (GNR)'}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Tutup">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* kiri */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Item Name *</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.item_name || ''}
                    onChange={(e) => update('item_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Brand</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.brand ?? ''}
                    onChange={(e) => update('brand', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">S/N</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.serial_number ?? ''}
                    onChange={(e) => update('serial_number', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.purchase_date ?? ''}
                    onChange={(e) => update('purchase_date', e.target.value || null)}
                  />
                </div>
              </div>

              {/* kanan */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">User Assigned</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.user_assigned ?? ''}
                    onChange={(e) => update('user_assigned', e.target.value)}
                    placeholder="Nama pengguna (opsional)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Departement</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.department ?? ''}
                    onChange={(e) => update('department', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Location *</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.location || ''}
                    onChange={(e) => update('location', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Remarks</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.remarks ?? ''}
                    onChange={(e) => update('remarks', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category *</label>
                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={form.category || ''}
                  onChange={(e) => update('category', e.target.value)}
                  required
                >
                  <option value="">- Pilih -</option>
                  {categoryOptions.map((c) => (
                    <option key={c.code} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Status *</label>
                <select
                  className="w-full border rounded-lg p-2 text-sm"
                  value={form.status || ''}
                  onChange={(e) => update('status', e.target.value)}
                  required
                >
                  <option value="">- Pilih -</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spesifikasi bila Laptop / PC */}
            {isLaptopOrPC && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Processor</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.processor ?? ''}
                    onChange={(e) => update('processor', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">RAM</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.ram ?? ''}
                    onChange={(e) => update('ram', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Storage</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.storage ?? ''}
                    onChange={(e) => update('storage', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">VGA</label>
                  <input
                    className="w-full border rounded-lg p-2 text-sm"
                    value={form.vga ?? ''}
                    onChange={(e) => update('vga', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2 border-t pt-3">
              <button type="button" onClick={onClose} className="px-3 py-2 border rounded hover:bg-gray-50">
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />} Simpan
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

