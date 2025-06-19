"use client";

import React from "react";
import { FileText, FileSpreadsheet, File } from "lucide-react";

type Activity = {
  id: number;
  activity_name: string;
  location: string;
  user: string;
  it: string;
  type: string;
  category: string;
  remarks: string;
  status: string;
  duration?: string;
  created_at: string;
  updated_at?: string;
};

type Props = {
  activities: Activity[];
};

export default function ExportButtons({ activities }: Props) {
  const exportCSV = () => {
    const headers = [
      "activity_name",
      "location",
      "user",
      "it",
      "type",
      "category",
      "remarks",
      "status",
      "duration",
      "created_at",
      "updated_at",
    ];

    const csvContent = [
      headers.join(","),
      ...activities.map((a) =>
        headers.map((h) => `"${(a as Record<string, string | number | null>)[h] ?? ""}"`).join(",")
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
        "Activity", "Location", "User", "IT", "Type", "Category", "Status", "Duration", "Created At", "Updated At"
      ]],
      body: activities.map((a) => [
        a.activity_name, a.location, a.user, a.it, a.type, a.category,
        a.status, a.duration || "-", a.created_at, a.updated_at || "-"
      ]),
    });
    doc.save("activities.pdf");
  };

  return (
    <div className="flex gap-2 flex-wrap justify-end">
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 transition"
        title="Export to CSV"
      >
        <FileText size={16} />
        CSV
      </button>
      <button
        onClick={exportExcel}
        className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded hover:bg-green-200 transition"
        title="Export to Excel"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
      <button
        onClick={exportPDF}
        className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded hover:bg-red-200 transition"
        title="Export to PDF"
      >
        <File size={16} />
        PDF
      </button>
    </div>
  );
}
