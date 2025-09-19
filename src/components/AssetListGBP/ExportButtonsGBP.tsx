'use client';

import * as XLSX from 'xlsx';
import { FileDown } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { AssetGBP } from './AssetFormModalGBP';

type Props = {
  userId: string;
  fetchAssets: () => void;
  role: string;
};

export default function ExportButtonsGBP({ userId, fetchAssets, role }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const fileName = `asset_gbp_export_${today}.xlsx`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAllAssets = async (): Promise<AssetGBP[]> => {
    const { data, error } = await supabase
      .from('asset_gbp')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Gagal fetch semua data asset_gbp:', error);
      return [];
    }
    return (data || []) as AssetGBP[];
  };

  const handleExportExcel = async () => {
    const rows = await fetchAllAssets();
    if (rows.length === 0) return;

    const headers = [
      'id',               // = asset_id
      'item_name',
      'category',
      'brand',
      'serial_number',
      'status',
      'location',
      'user_assigned',
      'department',
      'purchase_date',
      'remarks',
      'processor',
      'ram',
      'storage',
      'vga',
      'company',
      'qr_value',
      'created_at',
      'created_by',
      'updated_at',
      'updated_by',
    ] as const;

    const data = rows.map((a) => {
      const obj: Record<string, any> = {};
      headers.forEach((h) => (obj[h] = (a as any)[h] ?? ''));
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(data, { header: headers as unknown as string[] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asset GBP');
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      onClick={handleExportExcel}
      className="bg-white border text-gray-700 hover:bg-gray-50 px-3 py-2 rounded flex items-center gap-2 text-sm"
      title="Export Excel"
    >
      <FileDown size={16} />
      Export
    </button>
  );
}
