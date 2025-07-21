'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { usePagination } from '@/hooks/usePagination';
import { useUserRole } from '@/hooks/useUserRole';
import ITAssetTable from '@/components/ITAssetList/ITAssetTable';
import ITAssetForm from '@/components/ITAssetList/ITAssetForm';
import ITAssetFilterBar from '@/components/ITAssetList/ITAssetFilterBar';
import ImportExcel from '@/components/ITAssetList/ImportExcel';

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
  const [itemsPerPage, setItemsPerPage] = useState(30); // ✅ default 30 per page

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
    company: '',
    department: '',
    user_id: '',
    purchase_date: '',
  });

  const router = useRouter();
  const { role, userId } = useUserRole();

  const fetchAssets = async () => {
    const { data, error } = await supabase.from('it_assets').select('*').order('id');
    if (!error && data) setAssets(data);
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
  }, []);

  const filteredAssets = assets.filter((asset) =>
    Object.values(asset)
      .filter((value) => typeof value === 'string')
      .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const {
    currentPage,
    paginatedItems,
    totalPages,
    nextPage,
    prevPage,
  } = usePagination(filteredAssets.length, itemsPerPage);

  const displayedAssets = paginatedItems(filteredAssets);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">IT Asset List</h1>
{/*         <ImportExcel userId={userId || ''} fetchAssets={fetchAssets} /> */}
      </div>

      {/* Filter/Search Bar */}
      <ITAssetFilterBar
        searchTerm={searchTerm}
        onSearch={(term) => setSearchTerm(term)}
        onAdd={() => {
          setIsOpen(true);
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
            company: '',
            department: '',
            user_id: '',
            purchase_date: '',
          });
        }}
        assets={displayedAssets}
        role={role}
      />

      {/* Table */}
      <ITAssetTable
        assets={displayedAssets}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onEdit={(asset) => {
          setForm(asset);
          setIsEditing(true);
          setEditId(asset.id);
          setIsOpen(true);
        }}
        onDelete={async (id) => {
          const { error } = await supabase.from('it_assets').delete().eq('id', id);
          if (!error) fetchAssets();
        }}
        role={role}
      />

      {/* Pagination + Dropdown */}
      <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
        <p className="text-sm">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAssets.length)} dari {filteredAssets.length}
        </p>

        <div className="flex items-center gap-2">
          <label className="text-sm">Tampilkan:</label>
          <select
            className="border px-2 py-1 rounded text-sm"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
          >
            {[10, 20, 30, 50].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

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
            disabled={currentPage * itemsPerPage >= filteredAssets.length}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Form Modal */}
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
}
