'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ActivityForm, { FormData } from './ActivityForm';
import ExportButtons from './ExportButtons';
import ActivityTable from './ActivityTable';
import ActivityFilter from './ActivityFilter';
import { Activity } from '@/types/activity';

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);

  const initialFormData: FormData = {
    activity_name: '',
    location: '',
    user: '',
    it: '',
    type: '',
    category: '',
    remarks: '',
    status: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const fetchActivities = async () => {
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false });

    if (dateFilter.from) {
      query = query.gte('created_at', `${dateFilter.from}T00:00:00`);
    }
    if (dateFilter.to) {
      query = query.lte('created_at', `${dateFilter.to}T23:59:59`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setActivities(data);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [dateFilter]);

  const calculateDuration = (created: string, updated: string) => {
    const start = new Date(created).getTime();
    const end = new Date(updated).getTime();
    const totalMinutes = Math.floor((end - start) / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const now = new Date().toISOString();
    const isCompleted = formData.status === 'Completed';

    const updated_at = now;
    const created_at = editingActivity?.created_at || now;
    let duration;

    if (isCompleted) {
      duration = calculateDuration(created_at, updated_at);
    }

    const {
      created_at: _omitCreatedAt, // ✅ agar tidak ikut masuk ke payload update
      ...payloadForm
    } = formData;

    const payload = {
      ...payloadForm,
      updated_at,
      ...(duration ? { duration } : {}),
    };

    if (editingActivity) {
      await supabase.from('activities').update(payload).eq('id', editingActivity.id);
    } else {
      await supabase.from('activities').insert({
        ...payload,
        created_at, // ✅ hanya saat insert
      });
    }

    fetchActivities();
    setShowForm(false);
    setEditingActivity(null);
    setFormData(initialFormData);
  } finally {
    setLoading(false);
  }
};


  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      activity_name: activity.activity_name,
      location: activity.location,
      user: activity.user,
      it: activity.it,
      type: activity.type,
      category: activity.category,
      remarks: activity.remarks,
      status: activity.status,
      duration: activity.duration,
      updated_at: activity.updated_at,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await supabase.from('activities').delete().eq('id', id);
    fetchActivities();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h1 className="text-xl font-semibold">Activity Log</h1>
        <div className="flex flex-wrap items-center gap-2">
          <ActivityFilter
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
          <ExportButtons
            data={activities}
            onAdd={() => {
              setEditingActivity(null);
              setFormData(initialFormData);
              setShowForm(true);
            }}
          />
        </div>
      </div>

      <ActivityTable
        data={activities}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-2">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6 overflow-auto max-h-[90vh]">
            <ActivityForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              loading={loading}
              editingId={editingActivity?.id ?? null}
              onCancel={() => {
                setShowForm(false);
                setEditingActivity(null);
                setFormData(initialFormData);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
