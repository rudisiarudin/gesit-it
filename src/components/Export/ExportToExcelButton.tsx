'use client';

import * as XLSX from 'xlsx';
import { FileSpreadsheet } from 'lucide-react';

interface ExportToExcelIconButtonProps {
  data: any[];
  fileName?: string;
  columns?: string[];
  tooltip?: string;
}

export default function ExportToExcelIconButton({
  data,
  fileName = 'Export',
  columns,
  tooltip = 'Export to Excel',
}: ExportToExcelIconButtonProps) {
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
      className="inline-flex items-center justify-center p-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition duration-200"
      title={tooltip}
    >
      <FileSpreadsheet size={18} strokeWidth={2} />
    </button>
  );
}
