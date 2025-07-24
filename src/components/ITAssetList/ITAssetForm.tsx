'use client';

import { Dialog } from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Asset } from '@/app/dashboard/it-assets/page';
import AdditionalSpecs from '@/components/ITAssetList/AdditionalSpecs';
import { toast } from 'sonner';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLaptopOrPC =
    form.category?.toLowerCase().includes('laptop') ||
    form.category?.toLowerCase().includes('pc');

  const generateId = async (category: string, company: string) => {
    const companyCodeMap: Record<string, string> = {
      'gesit alumas': 'GA',
      'gesit perkasa': 'GP',
      'gesit graha': 'GG',
      'alakasa industrindo': 'AI',
      'dharma alumas sakti': 'DAS',
      'dinamika sejahtera mandiri': 'DSM',
      'js capital': 'JIG',
      'gesit foundation': 'GF',
    };

    const categoryCodeMap: Record<string, string> = {
      'laptop': 'LP',
      'pc': 'PC',
      'printer': 'PR',
      'monitor': 'MN',
      'proyektor': 'PJ',
      'router': 'RT',
      'storage': 'ST',
      'switch': 'SW',
      'access point': 'AP',
      'peripherals': 'PH',
      'security': 'SC',
      'tools': 'TL',
    };

    const companyKey = Object.keys(companyCodeMap).find((key) =>
      company.toLowerCase().includes(key)
    );
    const companyCode = companyKey ? companyCodeMap[companyKey] : 'XX';

    const categoryKey = Object.keys(categoryCodeMap).find((key) =>
      category.toLowerCase().includes(key)
    );
    const catCode = categoryKey ? categoryCodeMap[categoryKey] : 'OT';

    const prefix = `${companyCode}-${catCode}-`;

    const { data, error } = await supabase
      .from('it_assets')
      .select('id')
      .like('id', `${prefix}%`);

    if (error) throw new Error('Gagal mengambil ID');

    const usedNumbers = (data || [])
      .map((item) => item.id.split('-')[2])
      .map((num) => parseInt(num, 10))
      .filter((n) => !isNaN(n));

    let newNumber = 1;
    while (usedNumbers.includes(newNumber)) {
      newNumber++;
    }

    const newSerial = String(newNumber).padStart(3, '0');
    return `${prefix}${newSerial}`;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!userId) {
        toast.error('User tidak ditemukan. Silakan login ulang.');
        return;
      }

      const requiredFields = [
        'item_name', 'category', 'brand', 'serial_number',
        'status', 'location', 'user_assigned', 'company', 'department'
      ];

      const isValid = requiredFields.every((key) => {
        const value = form[key as keyof typeof form];
        return typeof value === 'string' && value.trim() !== '';
      });

      if (!isValid) {
        toast.error('Harap lengkapi semua field wajib.');
        return;
      }

      if (isLaptopOrPC) {
        const specFields = ['storage', 'ram', 'vga', 'processor'];
        const isSpecValid = specFields.every((key) => {
          const val = form[key as keyof typeof form];
          return typeof val === 'string' && val.trim() !== '';
        });

        if (!isSpecValid) {
          toast.error('Harap lengkapi semua spesifikasi tambahan.');
          return;
        }
      }

      const cleanedForm = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
      );

      let idToUse = editId;
      if (!isEditing) {
        try {
          idToUse = await generateId(form.category, form.company!);
        } catch (e: any) {
          toast.error(e.message || 'Gagal membuat ID.');
          return;
        }
      }

      const qrValue = `${location.origin}/asset?id=${idToUse}`;

      const payload = {
        ...cleanedForm,
        id: idToUse,
        qr_value: qrValue,
        user_id: userId,
      };

      const { error } = isEditing
        ? await supabase.from('it_assets').update(payload).eq('id', editId!)
        : await supabase.from('it_assets').insert([payload]);

      if (error) {
        console.error('Supabase error:', error);
        toast.error(isEditing ? 'Gagal update asset.' : 'Gagal menambah asset.');
        return;
      }

      toast.success(isEditing ? 'Asset berhasil diupdate.' : 'Asset berhasil ditambahkan.');
      onClose();
      fetchAssets();
    } catch (e: any) {
      toast.error(e.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl shadow-xl p-4 md:p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3">
            <Dialog.Title className="text-lg md:text-xl font-semibold text-gray-800">
              {isEditing ? 'Edit Asset' : 'Tambah Asset'}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Tutup Form">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="Gesit Graha">Gesit Graha</option>
                  <option value="Alakasa Industrindo">Alakasa Industrindo</option>
                  <option value="Dharma Alumas Sakti">Dharma Alumas Sakti</option>
                  <option value="Dinamika Sejahtera Mandiri">Dinamika Sejahtera Mandiri</option>
                  <option value="JS Capital">JS Capital</option>
                  <option value="Gesit Foundation">Gesit Foundation</option>
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
                  <option value="Storage">Storage</option>
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
            {isLaptopOrPC && <AdditionalSpecs form={form} setForm={setForm} />}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isEditing ? 'Menyimpan Perubahan...' : 'Menyimpan Data...'}</span>
                  </>
                ) : (
                  isEditing ? 'Update Asset' : 'Tambah Asset'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
