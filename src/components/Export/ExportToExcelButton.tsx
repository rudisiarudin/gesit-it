'use client';

import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface ExportToExcelButtonProps {
  // Salah satu wajib diisi
  data?: any[]; // data dari state (mode lokal)
  tableName?: string; // fetch dari Supabase (mode server)
  fileName?: string;
  tooltip?: string;
  columns?: string[]; // kolom yang disertakan
  filters?: { column: string; value: string | number }; // hanya untuk mode Supabase
}

export default function ExportToExcelButton({
  data,
  tableName,
  fileName = 'Export',
  tooltip = 'Export data ke Excel',
  columns,
  filters,
}: ExportToExcelButtonProps) {
  const handleExport = async () => {
    let exportData: any[] = [];

    // Mode lokal
    if (data && Array.isArray(data)) {
      exportData = data;
    }
    // Mode fetch dari Supabase
    else if (tableName && typeof tableName === 'string') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase.from(tableName).select('*').range(0, 9999);

      if (filters) {
        query = query.eq(filters.column, filters.value);
      }

      const { data: fetchedData, error } = await query;

      if (error || !fetchedData || fetchedData.length === 0) {
        console.error('❌ Gagal fetch data dari Supabase:', error?.message || error || 'Unknown error');
        return;
      }

      exportData = fetchedData;
    } else {
      console.error('❌ Harus menyediakan data (props.data) atau tableName (props.tableName)');
      return;
    }

    if (exportData.length === 0) {
      console.warn('⚠ Tidak ada data untuk diekspor.');
      return;
    }

    // Tentukan kolom yang disertakan
    const includedFields = columns || Object.keys(exportData[0]);

    // Tambahkan kolom No + filter field
    const formatted = exportData.map((row, index) => {
      const rowFormatted: Record<string, any> = { No: index + 1 };
      includedFields.forEach((key) => {
        rowFormatted[key] = row[key] ?? '';
      });
      return rowFormatted;
    });

    // Generate Excel
    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

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
