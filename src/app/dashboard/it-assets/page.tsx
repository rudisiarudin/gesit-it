'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/hooks/useUserRole';
import ITAssetTable from '@/components/ITAssetList/ITAssetTable';
import ITAssetCardList from '@/components/ITAssetList/ITAssetCardList';
import ITAssetForm from '@/components/ITAssetList/ITAssetForm';
import ITAssetFilterBar from '@/components/ITAssetList/ITAssetFilterBar';
import AssetSkeleton from '@/components/ITAssetList/AssetSkeleton';
import AssetTableSkeleton from '@/components/ITAssetList/AssetTableSkeleton';

export interface Asset {
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
  company?: string;
  department?: string;
  qr_value: string;
  user_id?: string;
  purchase_date?: string;
}

export default function ItAssetListPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [form, setForm] = useState<Omit<Asset, 'qr_value'>>({ ...emptyForm });

  const router = useRouter();
  const { role, userId } = useUserRole();

  const fetchAssets = async () => {
    setLoading(true);
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const query = supabase
      .from('it_assets')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('id');

    if (searchTerm) {
      query.ilike('item_name', `%${searchTerm}%`);
    }

    const { data, error, count } = await query;

    if (!error && data) {
      setAssets(data);
      setTotalItems(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        fetchAssets();
      }
    };
    checkSession();
  }, [currentPage, itemsPerPage, searchTerm]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">IT Asset List</h1>
      </div>

      <ITAssetFilterBar
        searchTerm={searchTerm}
        onSearch={(term) => {
          setCurrentPage(1);
          setSearchTerm(term);
        }}
        onAdd={() => {
          setIsOpen(true);
          setIsEditing(false);
          setEditId(null);
          setForm({ ...emptyForm });
        }}
        assets={assets}
        role={role}
      />

      {loading ? (
        <>
          <div className="block md:hidden"><AssetSkeleton count={5} /></div>
          <div className="hidden md:block"><AssetTableSkeleton rows={10} /></div>
        </>
      ) : (
        <>
          <div className="block md:hidden">
            <ITAssetCardList
              assets={assets}
              onEdit={handleEdit}
              onDelete={handleDelete}
              role={role}
            />
          </div>
          <div className="hidden md:block">
            <ITAssetTable
              assets={assets}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              role={role}
            />
          </div>

          <div className="flex justify-between items-center text-sm mt-4 flex-wrap gap-2">
            <p>
              Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems}
            </p>
            <div className="flex items-center gap-2">
              <label>Tampilkan:</label>
              <select
                className="border px-2 py-1 rounded text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 20, 30, 50].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="space-x-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </>
      )}

      <ITAssetForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isEditing={isEditing}
        editId={editId}
        form={form}
        setForm={setForm}
        userId={userId || ''}
        fetchAssets={fetchAssets}
      />
    </div>
  );

  function handleEdit(asset: Asset) {
    setForm(asset);
    setIsEditing(true);
    setEditId(asset.id);
    setIsOpen(true);
  }

  async function handleDelete(id: string) {
    if (confirm('Yakin ingin menghapus aset ini?')) {
      const { error } = await supabase.from('it_assets').delete().eq('id', id);
      if (!error) fetchAssets();
    }
  }
}

const emptyForm: Omit<Asset, 'qr_value'> = {
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
  company: '',
  department: '',
  user_id: '',
  purchase_date: '',
};
