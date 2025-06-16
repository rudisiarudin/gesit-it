'use client';

import { Activity } from '@/types/activity';
import { Download } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Props = {
  data: Activity[];
};

export default function ExportButtons({ data }: Props) {
  const exportToCSV = () => {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Activities');
    writeFile(workbook, 'activity_log.csv');
  };

  const exportToExcel = () => {
    const worksheet = utils.json_to_sheet(data);
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
      new Date(item.created_at).toLocaleString('en-GB'),
    ]);

    autoTable(doc, {
      head: [['Activity', 'User', 'IT', 'Status', 'Duration', 'Created At']],
      body: tableData,
    });

    doc.save('activity_log.pdf');
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="flex gap-2">
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
        className="bg-red-500 text-sm px-3 py-1.5 rounded hover:bg-red-300 flex items-center gap-1"
      >
        <Download size={14} /> PDF
      </button>
    </div>
  );
}
