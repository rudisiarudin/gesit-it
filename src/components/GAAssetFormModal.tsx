'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GAAsset, emptyAssetForm } from '@/components/types';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  fetchAssets: () => void;
  form: GAAsset;
  setForm: (f: GAAsset) => void;
  isEditing: boolean;
  editId: string | null;
  userId?: string | null;
};

export default function GAAssetFormModal({
  isOpen,
  onClose,
  fetchAssets,
  form,
  setForm,
  isEditing,
  editId,
  userId = null,
}: Props) {
  const [error, setError] = useState('');

  const sanitizeDate = (val: string | null | undefined) =>
    val && val !== '' ? val : null;

  const handleImageUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}.${ext}`;
    const filePath = `ga-assets/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Upload gambar gagal');
      return;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    setForm({ ...form, image_url: data.publicUrl });
  };

  const generateId = async (category: string, createdAt: string) => {
    const [yy, mm, dd] = createdAt.slice(0, 10).split('-');
    const catCode = category.toUpperCase().slice(0, 2);
    const { count } = await supabase
      .from('ga_assets')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .gte('created_at', `${createdAt}T00:00:00`)
      .lte('created_at', `${createdAt}T23:59:59`);

    const no = String((count || 0) + 1).padStart(3, '0');
    return `GA-${dd}${mm}${yy}-${catCode}-${no}`;
  };

  const handleSubmit = async () => {
    if (!form.item_name || !form.category || !form.status || !form.location) {
      setError('Mohon lengkapi semua field wajib');
      toast.error('Mohon lengkapi semua field wajib');
      return;
    }

    setError('');

    if (isEditing && editId) {
      const { error: updateError } = await supabase
        .from('ga_assets')
        .update({
          ...form,
          purchase_date: sanitizeDate(form.purchase_date),
          stnk_expiry: sanitizeDate(form.stnk_expiry),
          user_id: userId || '',
          qr_value: `${location.origin}/ga-asset?id=${editId}`,
        })
        .eq('id', editId);

      if (updateError) {
        toast.error('Gagal memperbarui asset');
        console.error(updateError);
        return;
      }

      toast.success('Asset berhasil diperbarui');
    } else {
      const now = new Date().toISOString();
      const newId = await generateId(form.category, now.slice(0, 10));

      const { error: insertError } = await supabase.from('ga_assets').insert([
        {
          ...form,
          id: newId,
          created_at: now,
          user_id: userId || '',
          qr_value: `${location.origin}/ga-asset?id=${newId}`,
          purchase_date: sanitizeDate(form.purchase_date),
          stnk_expiry: sanitizeDate(form.stnk_expiry),
        },
      ]);

      if (insertError) {
        toast.error(`Gagal menambahkan asset: ${insertError.message}`);
        console.error(insertError);
        return;
      }

      toast.success('Asset berhasil ditambahkan');
    }

    fetchAssets();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-4 md:p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg md:text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Asset' : 'Add Asset'}
            </Dialog.Title>
            <button onClick={onClose} className="text-2xl font-bold leading-none">&times;</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'item_name', 'brand', 'serial_number', 'status', 'location',
              'user_assigned', 'remarks', 'department', 'condition',
            ].map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</label>
                <input
                  type="text"
                  value={(form[key as keyof GAAsset] as string) || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="border px-3 py-2 rounded w-full text-sm"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm text-gray-600">Category</label>
              <select
                value={form.category || ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border px-3 py-2 rounded w-full text-sm"
              >
                <option value="">-- Select Category --</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Meja">Meja</option>
                <option value="Kursi">Kursi</option>
                <option value="Lemari">Lemari</option>
                <option value="Peralatan Dapur">Peralatan Dapur</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Purchase Date</label>
              <input
                type="date"
                value={form.purchase_date?.slice(0, 10) || ''}
                onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                className="border px-3 py-2 rounded w-full text-sm"
              />
            </div>

            {form.category === 'Kendaraan' && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">No Plat</label>
                  <input
                    type="text"
                    value={form.no_plate || ''}
                    onChange={(e) => setForm({ ...form, no_plate: e.target.value })}
                    className="border px-3 py-2 rounded w-full text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Jenis Kendaraan</label>
                  <input
                    type="text"
                    value={form.vehicle_type || ''}
                    onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                    className="border px-3 py-2 rounded w-full text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">STNK Expiry</label>
                  <input
                    type="date"
                    value={form.stnk_expiry?.slice(0, 10) || ''}
                    onChange={(e) => setForm({ ...form, stnk_expiry: e.target.value })}
                    className="border px-3 py-2 rounded w-full text-sm"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-gray-600">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="text-sm"
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="preview"
                  className="mt-2 max-h-40 rounded border object-contain"
                />
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              {isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
