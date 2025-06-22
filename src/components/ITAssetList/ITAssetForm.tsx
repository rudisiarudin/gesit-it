'use client';

import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Asset } from '@/app/dashboard/it-assets/page';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  editId: string | null;
  form: Omit<Asset, 'qr_value'>;
  setForm: (form: Omit<Asset, 'qr_value'>) => void;
  userId?: string;
  fetchAssets: () => void;
}

export default function ITAssetForm({
  isOpen,
  onClose,
  isEditing,
  editId,
  form,
  setForm,
  userId,
  fetchAssets,
}: Props) {
  const isLaptopOrPC =
    form.category?.toLowerCase().includes('laptop') ||
    form.category?.toLowerCase().includes('pc');

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
      .eq('company', company);

    const serial = String((count || 0) + 1).padStart(3, '0');
    return `${companyCode}-${catCode}-${serial}`;
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }

    const requiredFields = ['item_name', 'category', 'brand', 'serial_number', 'status', 'location', 'user_assigned', 'company', 'department'];

    const isValid = requiredFields.every((key) => {
      const value = (form as Record<string, string>)[key];
      return value && value.trim() !== '';
    });

    if (!isValid) {
      alert('Harap lengkapi semua field wajib.');
      return;
    }

    const idToUse = isEditing && editId ? editId : await generateId(form.category, form.company!);
    const qrValue = `${location.origin}/asset?id=${idToUse}`;

    if (isEditing && editId) {
      const { error } = await supabase
        .from('it_assets')
        .update({ ...form, qr_value: qrValue })
        .eq('id', editId);

      if (error) {
        console.error('Update error:', error);
        alert('Gagal update asset.');
        return;
      }
    } else {
      const newId = await generateId(form.category, form.company!);
      const { error } = await supabase.from('it_assets').insert([{
        ...form,
        id: newId,
        qr_value: qrValue,
        user_id: userId,
      }]);

      if (error) {
        console.error('Insert error:', error);
        alert('Gagal menambah asset.');
        return;
      }
    }

    onClose();
    fetchAssets();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-4 md:p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3">
            <Dialog.Title className="text-lg md:text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Asset' : 'Tambah Asset'}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom kiri */}
              <div className="space-y-3">
                <label className="block text-sm text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
                <select
                  value={form.company || ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm"
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

                {['Item Name', 'Brand', 'Serial Number', 'Status'].map((label) => {
                  const key = label.toLowerCase().replace(/ /g, '_');
                  return (
                    <div key={key}>
                      <label className="block text-sm text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={(form as any)[key] || ''}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </div>
                  );
                })}

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={form.purchase_date || ''}
                    onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              {/* Kolom kanan */}
              <div className="space-y-3">
                <label className="block text-sm text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm"
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

                {['Location', 'User Assigned', 'Remarks', 'Department'].map((label) => {
                  const key = label.toLowerCase().replace(/ /g, '_');
                  return (
                    <div key={key}>
                      <label className="block text-sm text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={(form as any)[key] || ''}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spesifikasi Tambahan */}
            {isLaptopOrPC && (
              <>
                <hr className="my-6 border-gray-300" />
                <h3 className="text-base font-medium text-gray-800 mb-2">Spesifikasi Tambahan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Storage', 'RAM', 'VGA', 'Processor'].map((label) => {
                    const key = label.toLowerCase();
                    return (
                      <div key={key}>
                        <label className="block text-sm text-gray-700 mb-1">{label}</label>
                        <input
                          type="text"
                          value={(form as any)[key] || ''}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}

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
  );
}
