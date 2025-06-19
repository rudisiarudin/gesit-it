"use client";

import React from "react";
import { Pencil, Check, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Activity } from "@/types/activity"; // Pastikan pakai types global, bukan dari page

type Props = {
  activities?: Activity[]; // opsional
  handleEdit?: (a: Activity) => void;
  handleDelete?: (a: Activity) => void;
};

export default function ActivityTable({
  activities = [], // ✅ default ke array kosong agar .length aman
  handleEdit,
  handleDelete,
}: Props) {
  // ✅ Tambahkan validasi ekstra jika activities tidak array (opsional, tambahan aman)
  if (!Array.isArray(activities)) {
    console.warn("Invalid activities data:", activities);
    return null;
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow">
      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase tracking-wider">
          <tr>
            <th className="p-3">Activity</th>
            <th className="p-3">Location</th>
            <th className="p-3">User</th>
            <th className="p-3">IT</th>
            <th className="p-3">Type</th>
            <th className="p-3">Category</th>
            <th className="p-3">Status</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Created</th>
            <th className="p-3">Updated</th>
            <th className="p-3">Action</th>
            <th className="p-3">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {activities.length > 0 ? (
            activities.map((act) => (
              <tr key={act.id} className="border-b hover:bg-gray-50">
                <td className="p-3 max-w-[160px] truncate">{act.activity_name || "-"}</td>
                <td className="p-3 max-w-[140px] truncate">{act.location || "-"}</td>
                <td className="p-3 max-w-[120px] truncate">{act.user || "-"}</td>
                <td className="p-3">{act.it || "-"}</td>
                <td className="p-3">{act.type || "-"}</td>
                <td className="p-3">{act.category || "-"}</td>
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
                  {act.status || "-"}
                </td>
                <td className="p-3">{act.duration || "-"}</td>
                <td className="p-3 text-nowrap">
                  {act.created_at ? new Date(act.created_at).toLocaleString() : "-"}
                </td>
                <td className="p-3 text-nowrap">
                  {act.updated_at ? new Date(act.updated_at).toLocaleString() : "-"}
                </td>
                <td className="p-3 flex gap-2 items-center">
                  {act.status !== "Completed" && handleEdit && (
                    <button
                      onClick={() => handleEdit(act)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  {handleDelete && (
                    <button
                      onClick={() => handleDelete(act)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {act.status === "Completed" && !handleEdit && (
                    <Check className="text-green-600" />
                  )}
                </td>
                <td className="p-3 max-w-[200px] truncate">{act.remarks || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={12} className="p-4 text-center text-gray-500">
                No activities found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
