'use client';

import { useRef } from 'react';
import { Activity } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import ExportButtons from './ExportButtons';

interface Props {
  data?: Activity[];
  onEdit: (activity: Activity) => void;
}

export default function ActivityTable({ data = [], onEdit }: Props) {
  const tableRef = useRef(null);

  console.log("ActivityTable data:", data); // 👈 Debug log

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Activity Table</h2>
        <ExportButtons data={data} />
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500 italic">No data available.</p>
      ) : (
        <div className="overflow-auto border rounded-md" ref={tableRef}>
            
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Activity</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">IT</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Created At</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((activity) => (
                <tr
                  key={activity.id ?? `${activity.activity_name}-${activity.created_at}`}
                  className="hover:bg-gray-50"
                >
                  <td className="p-2">{activity.activity_name}</td>
                  <td className="p-2">{activity.user}</td>
                  <td className="p-2">{activity.it}</td>
                  <td className="p-2">{activity.status}</td>
                  <td className="p-2">{activity.duration || '-'}</td>
                  <td className="p-2">
                    {new Date(activity.created_at).toLocaleString('en-GB', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(activity)}
                      className="flex items-center gap-1"
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
