'use client';

import { Activity } from '@/types/activity';
import { Download, Plus } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Props = {
  data: Activity[];
  onAdd: () => void;
};

export default function ExportButtons({ data, onAdd }: Props) {
  const formatDate = (date: string | null | undefined) => {
    return date ? new Date(date).toLocaleString('en-GB') : '-';
  };

  const exportToCSV = () => {
    const formatted = data.map(({ id, ...rest }) => ({
      ...rest,
      created_at: formatDate(rest.created_at),
      updated_at: formatDate((rest as any).updated_at),
    }));
    const worksheet = utils.json_to_sheet(formatted);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Activities');
    writeFile(workbook, 'activity_log.csv');
  };

  const exportToExcel = () => {
    const formatted = data.map(({ id, ...rest }) => ({
      ...rest,
      created_at: formatDate(rest.created_at),
      updated_at: formatDate((rest as any).updated_at),
    }));
    const worksheet = utils.json_to_sheet(formatted);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Activities');
    writeFile(workbook, 'activity_log.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData = data.map(item => [
      item.activity_name,
      item.user,
      item.it,
      item.status,
      item.duration || '-',
      formatDate(item.created_at),
      formatDate((item as any).updated_at),
    ]);

    autoTable(doc, {
      head: [['Activity', 'User', 'IT', 'Status', 'Duration', 'Created At', 'Updated At']],
      body: tableData,
      styles: { fontSize: 8 },
    });

    doc.save('activity_log.pdf');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onAdd}
        className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1"
      >
        <Plus size={14} /> Add Activity
      </button>

      {data.length > 0 && (
        <>
          <button
            onClick={exportToCSV}
            className="bg-green-300 text-sm px-3 py-1.5 rounded hover:bg-green-200 flex items-center gap-1"
          >
            <Download size={14} /> CSV
          </button>
          <button
            onClick={exportToExcel}
            className="bg-green-100 text-sm px-3 py-1.5 rounded hover:bg-green-200 flex items-center gap-1"
          >
            <Download size={14} /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-500 text-white text-sm px-3 py-1.5 rounded hover:bg-red-400 flex items-center gap-1"
          >
            <Download size={14} /> PDF
          </button>
        </>
      )}
    </div>
  );
}