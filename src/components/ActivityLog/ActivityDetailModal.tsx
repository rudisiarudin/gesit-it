'use client';

import { Dialog } from '@headlessui/react';
import { Activity } from './types';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

type Props = {
  activity: Activity | null;
  onClose: () => void;
};

export default function ActivityDetailModal({ activity, onClose }: Props) {
  if (!activity) return null;

  return (
    <Dialog open={!!activity} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg bg-white rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-y-auto max-h-[90vh] p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
            aria-label="Close detail modal"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <Dialog.Title className="text-3xl font-extrabold text-indigo-600 mb-2 truncate">
            {activity.it}
          </Dialog.Title>

          {/* Activity Name & Category */}
          <p className="text-2xl font-semibold text-gray-900 mb-1">{activity.activity_name}</p>
          <p className="text-sm text-gray-500 italic mb-6">{activity.category}</p>

          {/* User and Type */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-lg font-medium text-gray-700">{activity.user}</div>
            <span
              className={clsx(
                "inline-block px-4 py-1 rounded-full text-sm font-semibold transition-colors duration-200",
                activity.type === "Major"
                  ? "bg-red-200 text-red-800"
                  : "bg-indigo-200 text-indigo-800"
              )}
            >
              {activity.type}
            </span>
          </div>

          {/* Status */}
          <div
            className={clsx(
              "inline-block px-4 py-1 rounded-full text-sm font-semibold mb-8",
              activity.status === "Completed"
                ? "bg-green-100 text-green-800"
                : activity.status === "On Progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {activity.status}
          </div>

          {/* Section divider */}
          <hr className="border-gray-200 mb-8" />

          {/* Dates & Duration */}
          <div className="grid grid-cols-2 gap-6 mb-8 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Created At</h4>
              <p>{format(new Date(activity.created_at), "dd MMM yyyy, HH:mm")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Updated At</h4>
              <p>{activity.updated_at ? format(new Date(activity.updated_at), "dd MMM yyyy, HH:mm") : "-"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Duration</h4>
              <p>{activity.duration || "-"}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Location</h4>
              <p>{activity.location || "-"}</p>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Remarks</h4>
            <p className="whitespace-pre-wrap text-gray-700">{activity.remarks || "-"}</p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
