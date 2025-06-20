// components/ActivityLog/ActivityTimeline.tsx
'use client';

import { Activity } from './types';

interface Props {
  activities: Activity[];
}

export default function ActivityTimeline({ activities }: Props) {
  return (
    <div className="space-y-6 border-l-2 border-gray-300 pl-6">
      {activities.map((activity) => (
        <div key={activity.id} className="relative pl-6 group">
          <span className="absolute left-[-10px] top-2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow" />

          <div className="bg-white shadow p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">
                {truncateName(activity.activity_name)}
              </h3>
              <span className="text-sm text-gray-500">
                {formatDate(activity.created_at)}
              </span>
            </div>

            <div className="mt-1 flex gap-2 flex-wrap items-center">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                {activity.status}
              </span>
              <span className="text-xs px-2 py-1 rounded-full border border-blue-600 text-blue-600">
                {activity.type}
              </span>
              <span className="text-xs text-gray-600">
                {shortenITName(activity.it)}
              </span>
            </div>

            {activity.remarks && (
              <p className="mt-2 text-sm text-gray-700">{activity.remarks}</p>
            )}
          </div>
        </div>
      ))}
      {activities.length === 0 && (
        <div className="text-center text-gray-500">No activities found.</div>
      )}
    </div>
  );
}

function truncateName(name: string) {
  return name.length > 20 ? name.slice(0, 20) + '...' : name;
}

function shortenITName(name: string) {
  return name.split(' ')[0];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}
