"use client";

import React from "react";
import { initialForm } from "./formUtils"; // ✅ ganti path sesuai lokasi sebenarnya

export type FormData = typeof initialForm;

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  setShowForm: (val: boolean) => void;
  editingId: number | null;
  setEditingId: (val: number | null) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
};

export default function ActivityForm({
  formData,
  setFormData,
  setShowForm,
  editingId,
  setEditingId,
  loading,
  handleSubmit,
}: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-6 border">
      <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Activity" : "New Activity"}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input Fields */}
          {[
            { label: "Activity Name", name: "activity_name" },
            { label: "Location", name: "location" },
            { label: "User", name: "user" },
            {
              label: "IT",
              name: "it",
              type: "select",
              options: ["Bendry", "Rudi"],
            },
            {
              label: "Type",
              name: "type",
              type: "select",
              options: ["Minor", "Major"],
            },
            {
              label: "Category",
              name: "category",
              type: "select",
              options: [
                "Network",
                "Hardware",
                "Software",
                "Printer",
                "Email",
                "Access Request",
                "Troubleshooting",
                "Other",
              ],
            },
          ].map(({ label, name, type, options }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name as keyof FormData] || ""}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select {label}</option>
                  {options!.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={name}
                  value={formData[name as keyof FormData] || ""}
                  onChange={handleChange}
                  className="input"
                  required
                />
              )}
            </div>
          ))}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium mb-1">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks || ""}
            onChange={handleChange}
            className="input"
            rows={2}
          />
        </div>

        {/* Status and optional fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status || ""}
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
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input name="duration" value={formData.duration || ""} readOnly className="input" />
              </div>
              {formData.updated_at && (
                <div>
                  <label className="block text-sm font-medium mb-1">Updated At</label>
                  <input
                    value={new Date(formData.updated_at).toLocaleString()}
                    readOnly
                    className="input"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? "Saving..." : editingId ? "Update Activity" : "Submit Activity"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
              setFormData(initialForm);
            }}
            className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
