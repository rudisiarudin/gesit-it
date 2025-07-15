'use client';

import { FileText, FileSpreadsheet, File } from 'lucide-react';
import { Activity } from './types';

type Props = {
  activities: Activity[];
};

export default function ExportButtons({ activities }: Props) {
  const headers = [
    "activity_name", "location", "user", "it", "type", "category",
    "status", "duration", "created_at", "updated_at", "remarks"
  ];

  // Tambahkan tanggal hari ini ke nama file
  const now = new Date();
  const dateString = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const fileName = `Activity_IT_${dateString}-Export`;

  const exportCSV = () => {
    const csvContent = [
      headers.join(","),
      ...activities.map((a) =>
        headers.map((h) => {
          const cell = (a as Record<string, any>)[h] ?? "";
          return `"${String(cell).replace(/"/g, '""')}"`;
        }).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const data = activities.map((a) => ({
      activity_name: a.activity_name,
      location: a.location,
      user: a.user,
      it: a.it,
      type: a.type,
      category: a.category,
      status: a.status,
      duration: a.duration || "-",
      created_at: a.created_at,
      updated_at: a.updated_at || "-",
      remarks: a.remarks
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activities");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleString();
    };

    const tableHead = [[
      "Activity", "Location", "User", "IT", "Type", "Category", "Status",
      "Duration", "Created At", "Updated At", "Remarks"
    ]];

    const tableBody = activities.map((a) => [
      a.activity_name || "-",
      a.location || "-",
      a.user || "-",
      a.it || "-",
      a.type || "-",
      a.category || "-",
      a.status || "-",
      a.duration ?? "-",
      formatDate(a.created_at),
      formatDate(a.updated_at),
      a.remarks || "-"
    ]);

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      styles: {
        fontSize: 8,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: "bold",
      },
      margin: { top: 40 },
    });

    doc.save(`${fileName}.pdf`);
  };

  return (
    <div className="flex gap-1 flex-wrap">
      <button
        type="button"
        onClick={exportCSV}
        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 transition"
        title="Export to CSV"
        aria-label="Export to CSV"
      >
        <FileText size={18} />
        CSV
      </button>
      <button
        type="button"
        onClick={exportExcel}
        className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded text-xs hover:bg-green-200 transition"
        title="Export to Excel"
        aria-label="Export to Excel"
      >
        <FileSpreadsheet size={18} />
        Excel
      </button>
      <button
        type="button"
        onClick={exportPDF}
        className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded text-xs hover:bg-red-200 transition"
        title="Export to PDF"
        aria-label="Export to PDF"
      >
        <File size={18} />
        PDF
      </button>
    </div>
  );
}
