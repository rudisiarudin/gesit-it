'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useUserRole } from '@/hooks/useUserRole';

import AssetFormModalGBP, { AssetGBP } from './AssetFormModalGBP';
import AssetTableGBP from './AssetTableGBP';

import { Plus, FileSpreadsheet } from 'lucide-react'; // pakai icon Excel dari lucide-react
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// ------ default form
const emptyFormGBP: AssetGBP = {
  item_name: '',
  category: '',
  brand: null,
  serial_number: null,
  status: 'Active',
  location: '',
  user_assigned: null,
  department: null,
  purchase_date: null,
  remarks: null,
  processor: null,
  ram: null,
  storage: null,
  vga: null,
  qr_value: null,
};

export default function AssetListGBP() {
  const router = useRouter();
  const { role, userId } = useUserRole();

  // data
  const [assets, setAssets] = useState<AssetGBP[]>([]);
  const [loading, setLoading] = useState(true);

  // form
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AssetGBP>(emptyFormGBP);

  // search + paging
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // session check
  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        fetchAssets();
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch
  const fetchAssets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('asset_gbp')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      toast.error('Gagal memuat data asset');
    } else {
      setAssets((data || []) as AssetGBP[]);
    }
    setLoading(false);
  };

  // filter
  const filteredAssets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) => {
      const pool = [
        a.id,
        a.item_name,
        a.category,
        a.brand,
        a.serial_number,
        a.status,
        a.location,
        a.user_assigned,
        a.department,
        a.remarks,
      ];
      return pool
        .filter((v) => typeof v === 'string')
        .some((v) => (v as string).toLowerCase().includes(q));
    });
  }, [assets, searchTerm]);

  // paging
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // actions
  const openCreate = () => {
    setForm(emptyFormGBP);
    setEditId(null);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleEdit = (asset: AssetGBP) => {
    setForm({
      ...emptyFormGBP,     // isi default termasuk company
      ...asset,
      brand: asset.brand ?? null,
      serial_number: asset.serial_number ?? null,
      user_assigned: asset.user_assigned ?? null,
      department: asset.department ?? null,
      purchase_date: asset.purchase_date ?? null,
      remarks: asset.remarks ?? null,
      processor: asset.processor ?? null,
      ram: asset.ram ?? null,
      storage: asset.storage ?? null,
      vga: asset.vga ?? null,
      qr_value: asset.qr_value ?? null,
    });
    setEditId(asset.id!);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (role !== 'admin') {
      toast.error('Hanya admin yang dapat menghapus');
      return;
    }
    const { error } = await supabase.from('asset_gbp').delete().eq('id', id);
    if (error) {
      toast.error('Gagal menghapus asset');
    } else {
      toast.success('Asset berhasil dihapus');
      fetchAssets();
    }
  };

  // export excel
  const exportExcel = async () => {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supa
      .from('asset_gbp')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    const headers = [
      'id', 'item_name', 'category', 'brand', 'serial_number',
      'status', 'location', 'user_assigned', 'department',
      'purchase_date', 'remarks', 'processor', 'ram', 'storage', 'vga',
      'company', 'qr_value', 'created_at', 'created_by', 'updated_at', 'updated_by'
    ] as const;

    const rows = (data as AssetGBP[]).map((a) => {
      const o: Record<string, any> = {};
      headers.forEach((h) => (o[h] = (a as any)[h] ?? ''));
      return o;
    });

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers as unknown as string[] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asset GBP');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `asset_gbp_export_${today}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl font-bold">Asset GBP List</h1>

      {/* Top toolbar: search kiri, tombol kanan */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search any field (item, brand, SN, status...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-64"
        />

        <div className="flex items-center gap-2">
          {/* Export (ikon Excel dari lucide-react) */}
          <button
            onClick={exportExcel}
            title="Export Excel"
            className="h-10 w-10 flex items-center justify-center rounded-md border bg-white hover:bg-green-50"
          >
            <FileSpreadsheet size={20} className="text-green-600" />
          </button>

          {/* Add Asset (hijau) */}
          {(role === 'admin' || role === 'staff') && (
            <button
              onClick={openCreate}
              className="h-10 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 rounded-md"
            >
              <Plus size={18} />
              Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border shadow-sm">
        <AssetTableGBP
          assets={pageItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          role={role || 'staff'}
        />

        {/* Bottom bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 px-3 py-3 border-t">
          <p className="text-sm">
            Showing {(currentPage - 1) * itemsPerPage + Math.min(1, pageItems.length)}
            – {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm">Tampilkan:</span>
            <select
              className="border px-2 py-1 rounded text-sm"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AssetFormModalGBP
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isEditing={isEditing}
        editId={editId}
        form={form}
        setForm={setForm}
        userId={userId || null}
        fetchAssets={fetchAssets}
      />
    </div>
  );
}
