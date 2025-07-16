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
import { toast } from 'sonner';

export default function GAAssetList() {
  const [assets, setAssets] = useState<GAAsset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<GAAsset>(emptyAssetForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10); // ✅ dropdown kontrol jumlah item

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

  const confirmDelete = (asset: GAAsset) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded shadow max-w-sm flex flex-col gap-2">
        <p className="text-sm font-medium">
          Hapus asset <b>{asset.item_name}</b>?
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t)}
            className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            onClick={() => handleDelete(asset.id, t)}
            className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    ));
  };

  const handleDelete = async (id: string, toastId?: string | number) => {
    if (role !== 'admin') return;
    const { error } = await supabase.from('ga_assets').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus asset');
    } else {
      toast.success('Asset berhasil dihapus');
      fetchAssets();
    }
    if (toastId) toast.dismiss(toastId);
  };

  const handleEdit = (asset: GAAsset) => {
    setForm(asset);
    setEditId(asset.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const filteredAssets = assets.filter((asset) =>
    Object.values(asset)
      .filter((val) => typeof val === 'string')
      .some((val) => val.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const { currentPage, totalPages, paginatedItems, nextPage, prevPage } = usePagination(
    filteredAssets.length,
    itemsPerPage
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
        onDelete={confirmDelete}
        role={role}
      />

      {/* Pagination + Dropdown */}
      <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
        <p className="text-sm">
          Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length}
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
            disabled={currentPage >= totalPages}
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
