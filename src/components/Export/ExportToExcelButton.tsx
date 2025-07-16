'use client';

import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';

interface ExportToExcelButtonProps {
  data: any[];
  fileName?: string;
  columns?: string[];
  tooltip?: string;
}

export default function ExportToExcelButton({
  data,
  fileName = 'Export',
  tooltip = 'Export to Excel',
  columns,
}: ExportToExcelButtonProps) {
  const handleExport = () => {
    const exportData = columns
      ? data.map((row) =>
          columns.reduce((obj, key) => {
            obj[key] = row[key];
            return obj;
          }, {} as any)
        )
      : data;

    const worksheet = XLSX.utils.json_to_sheet(exportData);
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
