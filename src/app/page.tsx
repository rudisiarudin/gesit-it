"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Pencil, Plus } from "lucide-react";
import clsx from "clsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  created_at: string;
  duration?: string;
};

const initialForm = {
  activity_name: "",
  location: "",
  user: "",
  it: "",
  type: "",
  category: "",
  remarks: "",
  status: "Pending",
  duration: "",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
export default function Page() {
  const [formData, setFormData] = useState(initialForm);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filterIT, setFilterIT] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fetchActivities = async () => {
    let query = supabase.from("activities").select("*").order("created_at", { ascending: false });

    if (filterIT) query = query.eq("it", filterIT);
    if (filterDateFrom) query = query.gte("created_at", `${filterDateFrom}T00:00:00`);
    if (filterDateTo) query = query.lte("created_at", `${filterDateTo}T23:59:59`);

    const { data, error } = await query;

    if (!error && data) setActivities(data as Activity[]);
  };

  useEffect(() => {
    fetchActivities();
  }, [filterIT, filterDateFrom, filterDateTo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let updatedData = { ...formData };

    if (formData.status === "Completed" && editingId) {
      const existing = activities.find((a) => a.id === editingId);
      if (existing) {
        const start = new Date(existing.created_at);
        const end = new Date();
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        updatedData.duration = `${hours}h ${minutes}m`;
      }
    }

    if (editingId) {
      await supabase.from("activities").update(updatedData).eq("id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("activities").insert([formData]);
    }

    setFormData(initialForm);
    setShowModal(false);
    await fetchActivities();
    setLoading(false);
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      activity_name: activity.activity_name,
      location: activity.location,
      user: activity.user,
      it: activity.it,
      type: activity.type,
      category: activity.category,
      remarks: activity.remarks,
      status: activity.status,
      duration: activity.duration ?? "",
    });
    setEditingId(activity.id);
    setShowModal(true);
  };
  const exportCSV = () => {
    const headers = Object.keys(initialForm).concat("created_at");
    const csvContent = [
      headers.join(","),
      ...activities.map((a) =>
        headers.map((h) => `"${(a as any)[h] ?? ""}"`).join(",")
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
        "Activity", "Location", "User", "IT", "Type", "Category", "Status", "Duration", "Created At"
      ]],
      body: activities.map((a) => [
        a.activity_name, a.location, a.user, a.it, a.type, a.category,
        a.status, a.duration || "-", a.created_at
      ]),
    });
    doc.save("activities.pdf");
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-4">📝 IT Activity Log</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="input max-w-[160px]"
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="input max-w-[160px]"
        />
        <select
          value={filterIT}
          onChange={(e) => setFilterIT(e.target.value)}
          className="input max-w-[160px]"
        >
          <option value="">All IT</option>
          <option value="Bendry">Bendry</option>
          <option value="Rudi">Rudi</option>
        </select>

        <div className="flex gap-2 ml-auto">
          <button onClick={exportCSV} className="bg-gray-100 px-3 py-2 rounded hover:bg-gray-200">CSV</button>
          <button onClick={exportExcel} className="bg-green-100 px-3 py-2 rounded hover:bg-green-200">Excel</button>
          <button onClick={exportPDF} className="bg-red-100 px-3 py-2 rounded hover:bg-red-200">PDF</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-xl relative">
            <button
              onClick={() => {
                setShowModal(false);
                setFormData(initialForm);
                setEditingId(null);
              }}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Activity" : "New Activity"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Activity Name", name: "activity_name" },
                  { label: "Location", name: "location" },
                  { label: "User", name: "user" },
                  { label: "IT", name: "it", type: "select", options: ["Bendry", "Rudi"] },
                  { label: "Type", name: "type", type: "select", options: ["Minor", "Major"] },
                  {
                    label: "Category", name: "category", type: "select", options: [
                      "Network", "Hardware", "Software", "Printer", "Email",
                      "Access Request", "Troubleshooting", "Other",
                    ],
                  },
                ].map(({ label, name, type, options }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    {type === "select" ? (
                      <select
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select {label}</option>
                        {options!.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="input"
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="input"
                      readOnly
                      placeholder="Auto on Completed"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {loading ? "Saving..." : editingId ? "Update Activity" : "Submit Activity"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm bg-white shadow rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Activity</th>
              <th className="p-3">Location</th>
              <th className="p-3">User</th>
              <th className="p-3">IT</th>
              <th className="p-3">Type</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Created At</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr key={act.id} className="border-b">
                <td className="p-3">{act.activity_name}</td>
                <td className="p-3">{act.location}</td>
                <td className="p-3">{act.user}</td>
                <td className="p-3">{act.it}</td>
                <td className="p-3">{act.type}</td>
                <td className="p-3">{act.category}</td>
                <td
                  className={clsx(
                    "p-3 font-semibold",
                    act.status === "Completed"
                      ? "text-green-600"
                      : act.status === "On Progress"
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {act.status}
                </td>
                <td className="p-3">{act.duration || "-"}</td>
                <td className="p-3">{new Date(act.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleEdit(act)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No activities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white text-3xl rounded-full shadow-xl flex items-center justify-center"
        title="Add Activity"
      >
        +
      </button>
    </main>
  );
}
