'use client';

import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

interface ExportToExcelButtonProps {
  data: any[];
  fileName?: string;
  buttonLabel?: string;
  columns?: string[];
}

export default function ExportToExcelButton({
  data,
  fileName = 'Export',
  buttonLabel = 'Export to Excel',
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
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
    >
      <Download size={16} />
      {buttonLabel}
    </button>
  );
}
