'use client';

import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface ExportToExcelButtonProps {
  tableName: string;
  fileName?: string;
  tooltip?: string;
  filters?: { column: string; value: string | number };
}

export default function ExportToExcelButton({
  tableName,
  fileName = 'IT_Assets',
  tooltip = 'Export semua data aset ke Excel',
  filters,
}: ExportToExcelButtonProps) {
  const handleExport = async () => {
    if (!tableName || typeof tableName !== 'string') {
      console.error('❌ Tabel tidak valid. Harap isi props tableName.');
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase.from(tableName).select('*').range(0, 9999);

    if (filters) {
      query = query.eq(filters.column, filters.value);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      console.error('❌ Gagal fetch data dari Supabase:', error?.message || error || 'Unknown error');
      return;
    }

    // Kolom yang ingin disertakan
    const includedFields = Object.keys(data[0]).filter(
      (key) =>
        ![
          'user_id',
          'role',
          'company',
          'department',
          'purchase_date',
          'created_at',
          'updated_at',
          'user_full_name',
        ].includes(key)
    );

    // Tambahkan kolom 'No' dan filter kolom lain
    const formatted = data.map((row, index) => {
      const filteredRow: Record<string, any> = { No: index + 1 };
      includedFields.forEach((key) => {
        filteredRow[key] = row[key] ?? '';
      });
      return filteredRow;
    });

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IT Assets');

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const fullName = `${fileName}_${dd}${mm}${yyyy}.xlsx`;

    XLSX.writeFile(wb, fullName);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center justify-center p-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition duration-200"
      title={tooltip}
    >
      <FileSpreadsheet size={18} strokeWidth={2} />
    </button>
  );
}
