'use client';

import { Activity } from '@/types/activity';
import { Pencil, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  data: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
};

export default function ActivityTable({ data, onEdit }: Props) {
  if (data.length === 0) {
    return (
      <div className="border rounded-lg p-6 text-center text-gray-500 mt-4 bg-white shadow-sm">
        No activities found.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">IT</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Updated At</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((activity) => (
              <tr
                key={activity.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2">{activity.activity_name}</td>
                <td className="px-4 py-2">{activity.user}</td>
                <td className="px-4 py-2">
                  <span
                    className={clsx(
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      {
                        'bg-green-100 text-green-700': activity.it.toLowerCase() === 'rudi',
                        'bg-blue-100 text-blue-700': activity.it.toLowerCase() === 'bendry',
                        'bg-gray-100 text-gray-700':
                          activity.it.toLowerCase() !== 'rudi' &&
                          activity.it.toLowerCase() !== 'bendry',
                      }
                    )}
                  >
                    {activity.it}
                  </span>
                </td>
                <td className="px-4 py-2">{activity.location}</td>
                <td className="px-4 py-2">
                  <span
                    className={clsx(
                      'px-2 py-1 rounded-full text-xs font-semibold',
                      {
                        'bg-green-100 text-green-700': activity.type.toLowerCase() === 'minor',
                        'bg-orange-100 text-orange-700': activity.type.toLowerCase() === 'major',
                        'bg-gray-100 text-gray-700':
                          activity.type.toLowerCase() !== 'minor' &&
                          activity.type.toLowerCase() !== 'major',
                      }
                    )}
                  >
                    {activity.type}
                  </span>
                </td>
                <td
                  className={clsx('px-4 py-2 font-semibold', {
                    'text-green-600': activity.status === 'Completed',
                    'text-yellow-600': activity.status === 'In Progress',
                    'text-red-600': activity.status === 'Pending',
                  })}
                >
                  {activity.status}
                </td>
                <td className="px-4 py-2">{activity.duration || '-'}</td>
                <td className="px-4 py-2">{activity.remarks || '-'}</td>
                <td className="px-4 py-2">
                  {new Date(activity.created_at).toLocaleString('en-GB')}
                </td>
                <td className="px-4 py-2">
                  {activity.updated_at
                    ? new Date(activity.updated_at).toLocaleString('en-GB')
                    : '-'}
                </td>
                <td className="px-4 py-2 text-center">
                  {activity.status === 'Completed' ? (
                    <CheckCircle size={18} className="text-green-500 mx-auto" />
                  ) : (
                    <button
                      onClick={() => onEdit(activity)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
