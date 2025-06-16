import { Activity } from "@/types/activity";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data: Activity[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Activities");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, "activities.xlsx");
};

export const exportToCSV = (data: Activity[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "activities.csv");
};

export const exportToPDF = (data: Activity[]) => {
  const doc = new jsPDF();
  const tableData = data.map((item) => [
    item.activity_name,
    item.location,
    item.user,
    item.it,
    item.type,
    item.category,
    item.status,
    item.duration || "-",
    new Date(item.created_at).toLocaleString(),
  ]);

  autoTable(doc, {
    head: [
      [
        "Activity",
        "Location",
        "User",
        "IT",
        "Type",
        "Category",
        "Status",
        "Duration",
        "Created At",
      ],
    ],
    body: tableData,
  });

  doc.save("activities.pdf");
};
