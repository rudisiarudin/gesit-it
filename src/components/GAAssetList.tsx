'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/hooks/useUserRole';
import { usePagination } from '@/hooks/usePagination';
import ExportToExcelButton from '@/components/Export/ExportToExcelButton';
import DownloadAllQRButton from '@/components/DownloadAllQRButton';
import { GAAsset, emptyAssetForm } from '@/components/types';
import GAAssetTable from './GAAssetTable';
import GAAssetFormModal from './GAAssetFormModal';

export default function GAAssetList() {
  const [assets, setAssets] = useState<GAAsset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GAAsset>(emptyAssetForm);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { role, userId } = useUserRole();

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
  }, [router]);

  const fetchAssets = async () => {
    const { data, error } = await supabase
      .from('ga_assets')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setAssets(data);
  };

  const handleEdit = (asset: GAAsset) => {
    setForm(asset);
    setEditId(asset.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (role !== 'admin') return;
    if (!confirm('Delete this asset?')) return;
    const { error } = await supabase.from('ga_assets').delete().eq('id', id);
    if (!error) fetchAssets();
  };

  const filteredAssets = assets.filter((asset) =>
  Object.values(asset)
    .filter((val) => typeof val === 'string')
    .some((val) =>
      val.toLowerCase().includes(searchTerm.toLowerCase())
    )
);

  const { currentPage, totalPages, paginatedItems, nextPage, prevPage } = usePagination(
    filteredAssets.length,
    10
  );
  const displayedAssets = paginatedItems(filteredAssets);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">GA Asset List</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search item, category, location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-full md:w-1/3"
        />
        <div className="flex flex-wrap gap-2">
          <ExportToExcelButton
            data={filteredAssets}
            fileName="GA_Asset_List"
            columns={[
              'id',
              'item_name',
              'category',
              'brand',
              'serial_number',
              'status',
              'location',
              'user_assigned',
              'remarks',
            ]}
          />
          <DownloadAllQRButton assets={displayedAssets} />
          {(role === 'admin' || role === 'staff') && (
            <button
              onClick={() => {
                setForm(emptyAssetForm);
                setIsEditing(false);
                setEditId(null);
                setIsOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              <PlusCircle size={18} className="inline mr-1" /> Asset
            </button>
          )}
        </div>
      </div>

      <GAAssetTable
        assets={displayedAssets}
        currentPage={currentPage}
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        role={role}
      />

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm">
          Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, filteredAssets.length)} of{' '}
          {filteredAssets.length}
        </p>
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
            disabled={currentPage * 10 >= filteredAssets.length}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <GAAssetFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        fetchAssets={fetchAssets}
        form={form}
        setForm={setForm}
        isEditing={isEditing}
        editId={editId}
        userId={userId}
      />
    </div>
  );
}
