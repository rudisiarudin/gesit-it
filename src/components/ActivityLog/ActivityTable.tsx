'use client';

import { Pencil, CheckCircle2, Trash2 } from 'lucide-react';
import { Activity } from '@/components/ActivityLog/types';
import clsx from 'clsx';
import { format } from 'date-fns';

type Props = {
  activities: Activity[];
  role: string; // Role user, contoh: 'admin', 'staff', 'user'
  onEdit: (activity: Activity) => void;
  onView: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
};

const getFirstName = (fullName: string) => fullName?.split(' ')[0] || fullName;

export default function ActivityTable({ activities, role, onEdit, onView, onDelete }: Props) {
  return (
    <div className="w-full">
      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow mt-4 md:mt-0">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 w-1/4">Activity</th>
              <th className="p-3 w-1/5">User</th>
              <th className="p-3 w-1/6">Type</th>
              <th className="p-3 w-1/6 text-center">Status</th>
              <th className="p-3 w-1/6">Time</th>
              <th className="p-3 text-center w-1/12">Duration</th>
              <th className="p-3 w-1/4">Remarks</th>
              <th className="p-3 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No activities found.
                </td>
              </tr>
            )}
            {activities.map((act) => (
              <tr
                key={act.id}
                className="border-b cursor-pointer hover:bg-gray-50"
                onClick={() => onView(act)}
              >
                <td className="p-3">
                  <div className="text-sm">
                    <span className="text-blue-600 font-medium">{getFirstName(act.it)}</span>
                    <span className="text-gray-800 font-semibold"> - {act.activity_name}</span>
                  </div>
                  <div className="text-xs italic text-gray-500 mt-1">({act.category})</div>
                </td>
                <td className="p-3">
                  <div className="font-medium">{getFirstName(act.user)}</div>
                  <div className="text-xs text-gray-500">{act.location}</div>
                </td>
                <td className="p-3">
                  <span
                    className={clsx(
                      "px-2 py-1 text-xs rounded-full font-semibold border select-none",
                      act.type === "Major"
                        ? "bg-red-200 text-red-800 border-red-300"
                        : "bg-indigo-200 text-indigo-800 border-indigo-300"
                    )}
                  >
                    {act.type}
                  </span>
                </td>
               <td className="p-3 text-center align-middle">
                  <span
                    className={clsx(
                      'inline-flex justify-center items-center px-2 py-1 text-xs rounded-full font-semibold border select-none',
                      act.status === 'Completed'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : act.status === 'On Progress'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    )}
                  >
                    {act.status}
                  </span>
                </td>

                <td className="p-3 text-xs leading-snug space-y-1">
                  <div>
                    <span className="text-gray-500">Create :</span>{" "}
                    <span className="font-semibold">{format(new Date(act.created_at), "dd MMM")}</span> |{" "}
                    <span className="text-gray-800">{format(new Date(act.created_at), "HH:mm")}</span>
                  </div>
                  {act.updated_at && (
                    <div>
                      <span className="text-blue-600">Update :</span>{" "}
                      <span className="font-semibold">{format(new Date(act.updated_at), "dd MMM")}</span> |{" "}
                      <span className="text-blue-800">{format(new Date(act.updated_at), "HH:mm")}</span>
                    </div>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span className="text-green-700 font-bold text-xs">{act.duration || "-"}</span>
                </td>
                <td className="p-3 text-xs italic text-gray-500 mt-1 whitespace-normal break-words">
                  {act.remarks}
                </td>
                <td
                  className="p-3 text-center space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {act.status === "Completed" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-green-700 bg-green-100 border border-green-300 rounded-full text-xs select-none">
                      <CheckCircle2 size={14} /> Done
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(act)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      {role === "admin" && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this activity?")) {
                              onDelete(act);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="md:hidden space-y-4">
        {activities.length === 0 && (
          <div className="text-center text-gray-500 py-6">No activities found.</div>
        )}
        {activities.map((act) => (
          <div
            key={act.id}
            className="bg-white border rounded-xl p-4 shadow hover:bg-gray-50 cursor-pointer"
            onClick={() => onView(act)}
          >
            <div className="text-sm font-semibold text-blue-600">{getFirstName(act.it)}</div>
            <div className="text-base font-bold text-gray-800">{act.activity_name}</div>
            <div className="text-xs italic text-gray-500 mb-2">({act.category})</div>

            <div className="flex items-center justify-between text-sm mb-1">
              <div className="text-gray-700">{getFirstName(act.user)}</div>
              <span
                className={clsx(
                  "px-2 py-1 text-xs rounded-full font-semibold border select-none",
                  act.type === "Major"
                    ? "bg-red-200 text-red-800 border-red-300"
                    : "bg-indigo-200 text-indigo-800 border-indigo-300"
                )}
              >
                {act.type}
              </span>
            </div>

            <div
              className={clsx(
                "text-sm font-semibold mb-1 rounded-full select-none",
                act.status === "Completed"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : act.status === "On Progress"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              )}
              style={{ display: 'inline-block', padding: '0.2rem 0.5rem' }}
            >
              {act.status}
            </div>

            <div className="text-xs space-y-1 mt-2">
              <div>
                <span className="text-gray-500">Create:</span>{" "}
                <span className="font-bold">{format(new Date(act.created_at), "dd MMM")}</span> |{" "}
                <span className="text-gray-800">{format(new Date(act.created_at), "HH:mm")}</span>
              </div>
              {act.updated_at && (
                <div>
                  <span className="text-blue-600">Update:</span>{" "}
                  <span className="font-bold">{format(new Date(act.updated_at), "dd MMM")}</span> |{" "}
                  <span className="text-blue-800">{format(new Date(act.updated_at), "HH:mm")}</span>
                </div>
              )}
            </div>

            <div className="mt-2 text-xs font-bold text-green-700">
              Duration: <span className="font-bold">{act.duration || "-"}</span>
            </div>

            <div className="mt-1 text-xs text-gray-600">{act.remarks}</div>

            <div className="mt-3 space-x-2">
              {act.status === "Completed" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-green-700 bg-green-100 border border-green-300 rounded-full text-xs select-none">
                  <CheckCircle2 size={14} /> Done
                </span>
              ) : (
                <>
                   {role === "staff" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(act);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center gap-1"
                    title="Edit"
                  >
                    )}
                    <Pencil size={14} /> Edit
                  </button>
                  {role === "admin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this activity?")) {
                          onDelete(act);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs inline-flex items-center gap-1"
                      title="Delete"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
