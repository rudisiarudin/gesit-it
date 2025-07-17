'use client';

import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface ExportToExcelButtonProps {
  data?: any[];               // mode lokal
  tableName?: string;         // mode fetch dari supabase
  columns?: string[];
  fileName?: string;
  tooltip?: string;
  filters?: { column: string; value: string | number };
}

export default function ExportToExcelButton({
  data,
  tableName,
  fileName = 'Export',
  tooltip = 'Export to Excel',
  columns,
  filters,
}: ExportToExcelButtonProps) {
  const fetchAllData = async (
    supabase: any,
    tableName: string,
    filters?: { column: string; value: string | number }
  ) => {
    const limit = 1000;
    let from = 0;
    let to = limit - 1;
    let allData: any[] = [];

    while (true) {
      let query = supabase.from(tableName).select('*').range(from, to);

      if (filters) {
        query = query.eq(filters.column, filters.value);
      }

      const { data: batch, error } = await query;

      if (error) {
        console.error('❌ Supabase fetch error:', {
          from,
          to,
          tableName,
          filters,
          errorMessage: error.message,
          rawError: error,
        });
        break;
      }

      if (!batch || batch.length === 0) break;

      allData = allData.concat(batch);

      if (batch.length < limit) break;

      from += limit;
      to += limit;
    }

    console.log('✅ Total data fetched:', allData.length);
    return allData;
  };

  const handleExport = async () => {
    let exportData: any[] = [];

    // Mode Lokal
    if (Array.isArray(data)) {
      exportData = data;
    }

    // Mode Supabase
    else if (typeof tableName === 'string') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (!supabase) {
        console.error('❌ Supabase client gagal dibuat.');
        return;
      }

      exportData = await fetchAllData(supabase, tableName, filters);
    }

    if (!exportData || exportData.length === 0) {
      console.warn('⚠ Tidak ada data untuk diekspor.');
      return;
    }

    // Format data + tambah kolom No
    const formatted = exportData.map((row, i) => {
      const obj: Record<string, any> = { No: i + 1 };
      (columns || Object.keys(row)).forEach((col) => {
        obj[col] = row[col] ?? '';
      });
      return obj;
    });

    // Buat worksheet
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Nama file pakai tanggal
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const fullName = `${fileName}_${dd}${mm}${yyyy}.xlsx`;

    XLSX.writeFile(workbook, fullName);
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
