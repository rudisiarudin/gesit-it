"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileText, FileSpreadsheet, File, Plus, Pencil, Check } from "lucide-react";
import clsx from "clsx";

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
  updated_at?: string;
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
  updated_at: "",
};

export default function Page() {
  const [formData, setFormData] = useState(initialForm);
  const [rawActivities, setRawActivities] = useState<Activity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterIT, setFilterIT] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRawActivities(data as Activity[]);
      }
    };

    fetchData();

    const channel = supabase
      .channel("realtime:activities")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          setRawActivities((prev) => {
            let updated = [...prev];
            if (eventType === "INSERT") {
              updated = [newRow as Activity, ...updated];
            } else if (eventType === "UPDATE") {
              updated = updated.map((a) =>
                a.id === (newRow as Activity).id ? (newRow as Activity) : a
              );
            } else if (eventType === "DELETE") {
              updated = updated.filter((a) => a.id !== (oldRow as Activity).id);
            }
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = [...rawActivities];

    if (filterIT) {
      filtered = filtered.filter((a) => a.it === filterIT);
    }

    if (filterDateFrom) {
      filtered = filtered.filter(
        (a) => new Date(a.created_at) >= new Date(`${filterDateFrom}T00:00:00`)
      );
    }

    if (filterDateTo) {
      filtered = filtered.filter(
        (a) => new Date(a.created_at) <= new Date(`${filterDateTo}T23:59:59`)
      );
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((a) =>
        Object.values(a)
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );
    }

    setActivities(filtered);
  }, [rawActivities, filterIT, filterDateFrom, filterDateTo, searchKeyword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = { ...formData };

    if (formData.status === "Completed") {
      const end = new Date().toISOString();
      updatedData.updated_at = end;

      if (editingId) {
        const existing = rawActivities.find((a) => a.id === editingId);
        if (existing) {
          const start = new Date(existing.created_at);
          const endTime = new Date(end);
          const durationMs = endTime.getTime() - start.getTime();
          const hours = Math.floor(durationMs / (1000 * 60 * 60));
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          updatedData.duration = `${hours}h ${minutes}m`;
        }
      }
    } 

    try {
      if (editingId) {
        await supabase.from("activities").update(updatedData).eq("id", editingId);
        setEditingId(null);
      } else {
        const cleanedData = Object.fromEntries(
          Object.entries(updatedData).filter(([_, v]) => v !== "")
        );
        await supabase.from("activities").insert([cleanedData]);
      }

      setFormData(initialForm);
      setShowForm(false);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: Activity) => {
    if (activity.status === "Completed") return;

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
      updated_at: activity.updated_at ?? "",
    });
    setEditingId(activity.id);
    setShowForm(true);
  };

  const exportCSV = () => {
    const headers = Object.keys(initialForm).concat("created_at");
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
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-4">📝 IT Activity Log</h1>

      <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
        <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="input max-w-[160px]" />
        <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="input max-w-[160px]" />
        <select value={filterIT} onChange={(e) => setFilterIT(e.target.value)} className="input max-w-[160px]">
          <option value="">All IT</option>
          <option value="Bendry">Bendry</option>
          <option value="Rudi">Rudi</option>
        </select>
        <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="🔍 Search..." className="input max-w-xs flex-1" />
        <div className="flex flex-wrap gap-2 justify-end items-center ml-auto">
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
  <button
    onClick={() => {
      setShowForm(!showForm);
      setEditingId(null);
      setFormData(initialForm);
    }}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
    title="Add Activity"
  >
    <Plus size={16} />
    Add
  </button>
</div>


      </div>

     {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 border">
          <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Activity" : "New Activity"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {[{ label: "Activity Name", name: "activity_name" }, { label: "Location", name: "location" }, { label: "User", name: "user" }, { label: "IT", name: "it", type: "select", options: ["Bendry", "Rudi"] }, { label: "Type", name: "type", type: "select", options: ["Minor", "Major"] }, { label: "Category", name: "category", type: "select", options: ["Network", "Hardware", "Software", "Printer", "Email", "Access Request", "Troubleshooting", "Other"] }]
                .map(({ label, name, type, options }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    {type === "select" ? (
                      <select name={name} value={formData[name as keyof typeof formData]} onChange={handleChange} className="input" required>
                        <option value="">Select {label}</option>
                        {options!.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input name={name} value={formData[name as keyof typeof formData]} onChange={handleChange} className="input" required />
                    )}
                  </div>
                ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="input" rows={2} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input" required>
                  <option value="Pending">Pending</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              {editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input name="duration" value={formData.duration} readOnly className="input" />
                  </div>
                  {formData.updated_at && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Updated At</label>
                      <input value={new Date(formData.updated_at).toLocaleString()} readOnly className="input" />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                {loading ? "Saving..." : editingId ? "Update Activity" : "Submit Activity"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialForm); }} className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
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
              <th className="p-3">Updated At</th>
              <th className="p-3">Action</th>
              <th className="p-3">Remarks</th>
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
                <td className={clsx("p-3 font-semibold", act.status === "Completed" ? "text-green-600" : act.status === "On Progress" ? "text-yellow-600" : "text-red-600")}>
                  {act.status}
                </td>
                <td className="p-3">{act.duration || "-"}</td>
                <td className="p-3">{new Date(act.created_at).toLocaleString()}</td>
                <td className="p-3">{act.updated_at ? new Date(act.updated_at).toLocaleString() : "-"}</td>
                <td className="p-3">
                  {act.status === "Completed" ? (
                    <Check className="text-green-600" />
                  ) : (
                    <button onClick={() => handleEdit(act)} className="text-blue-600 hover:text-blue-800" title="Edit">
                      <Pencil size={16} />
                    </button>
                  )}
                </td>
                 <td className="p-3">{act.remarks}</td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={11} className="p-4 text-center text-gray-500">
                  No activities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
    </main>
  );
}
