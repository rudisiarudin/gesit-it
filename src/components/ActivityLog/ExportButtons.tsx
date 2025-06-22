'use client';

import { FileText, FileSpreadsheet, File } from 'lucide-react';
import { Activity } from './types';

type Props = {
  activities: Activity[];
};

export default function ExportButtons({ activities }: Props) {
  const exportCSV = () => {
    const headers = [
      "activity_name", "location", "user", "it", "type", "category",
      "status", "duration", "created_at", "updated_at", "remarks"
    ];

    const csvContent = [
      headers.join(","),
      ...activities.map((a) =>
        headers.map((h) => `"${(a as Record<string, any>)[h] ?? ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "activities.csv";
    link.click();
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(activities);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activities");
    XLSX.writeFile(wb, "activities.xlsx");
  };

  const exportPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        "Activity", "Location", "User", "IT", "Type", "Category", "Status", "Duration", "Created At", "Updated At", "Remarks"
      ]],
      body: activities.map((a) => [
        a.activity_name,
        a.location,
        a.user,
        a.it,
        a.type,
        a.category,
        a.status,
        a.duration || "-",
        a.created_at,
        a.updated_at || "-",
        a.remarks
      ]),
    });
    doc.save("activities.pdf");
  };

  return (
    <div className="flex gap-1 flex-wrap">
      <button
        onClick={exportCSV}
        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs hover:bg-gray-200 transition"
        title="Export to CSV"
      >
        <FileText size={18} />
        CSV
      </button>
      <button
        onClick={exportExcel}
        className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded text-xs hover:bg-green-200 transition"
        title="Export to Excel"
      >
        <FileSpreadsheet size={18} />
        Excel
      </button>
      <button
        onClick={exportPDF}
        className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded text-xs hover:bg-red-200 transition"
        title="Export to PDF"
      >
        <File size={18} />
        PDF
      </button>
    </div>
  );
}
