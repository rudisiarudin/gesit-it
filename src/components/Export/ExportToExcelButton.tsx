'use client';

import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface ExportToExcelButtonProps {
  // Salah satu dari dua ini harus disediakan
  data?: any[];               // mode lokal
  tableName?: string;         // mode fetch
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
  const handleExport = async () => {
    let exportData: any[] = [];

    // Mode 1: Lokal
    if (Array.isArray(data)) {
      exportData = data;
    }

    // Mode 2: Fetch dari Supabase
    else if (typeof tableName === 'string') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase.from(tableName).select('*').range(0, 9999);
      if (filters) query = query.eq(filters.column, filters.value);

      const { data: fetchedData, error } = await query;
      if (error || !fetchedData) {
        console.error('❌ Gagal fetch data dari Supabase:', error);
        return;
      }
      exportData = fetchedData;
    }

    // Cek data
    if (!exportData || exportData.length === 0) {
      console.warn('⚠ Tidak ada data untuk diekspor.');
      return;
    }

    // Filter kolom + No
    const formatted = exportData.map((row, i) => {
      const obj: Record<string, any> = { No: i + 1 };
      (columns || Object.keys(row)).forEach((col) => {
        obj[col] = row[col] ?? '';
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

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
