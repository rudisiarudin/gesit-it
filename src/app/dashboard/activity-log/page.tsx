'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ActivityTable from '@/components/ActivityLog/ActivityTable';
import ActivityForm from '@/components/ActivityLog/ActivityForm';
import ActivityDetailModal from '@/components/ActivityLog/ActivityDetailModal';
import ExportButtons from '@/components/ActivityLog/ExportButtons';
import Pagination from '@/components/Pagination'; // Pastikan path benar
import { Filter, X } from 'lucide-react';
import { Activity, FormData } from '@/components/ActivityLog/types';

const initialForm: FormData = {
  activity_name: '',
  location: '',
  user: '',
  it: '',
  type: '',
  category: '',
  remarks: '',
  status: 'Pending',
  duration: '',
  updated_at: '',
};

export default function ActivityLogPage() {
  const [rawActivities, setRawActivities] = useState<Activity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [role, setRole] = useState<string>('user'); // default user
  const [userIt, setUserIt] = useState<string>(''); // user IT name from session

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil session & user role, user IT name
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      const userRole = sessionUser?.user_metadata?.role || 'user';
      setRole(userRole);

      // Ambil user IT dari user_metadata.full_name atau email fallback
      const fullName = sessionUser?.user_metadata?.full_name;
      setUserIt(fullName ?? sessionUser?.email ?? '');
    });
  }, []);

  // Fetch activities & realtime subscribe
  useEffect(() => {
    async function fetchActivities() {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setRawActivities(data as Activity[]);
    }
    fetchActivities();

    const channel = supabase
      .channel('realtime:activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          setRawActivities((prev) => {
            let updated = [...prev];
            if (eventType === 'INSERT') updated = [newRow as Activity, ...updated];
            else if (eventType === 'UPDATE')
              updated = updated.map((a) =>
                a.id === (newRow as Activity).id ? (newRow as Activity) : a
              );
            else if (eventType === 'DELETE')
              updated = updated.filter((a) => a.id !== (oldRow as Activity).id);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter & search activities
  useEffect(() => {
    let filtered = [...rawActivities];

    if (filterDateFrom)
      filtered = filtered.filter(
        (a) => new Date(a.created_at) >= new Date(`${filterDateFrom}T00:00:00`)
      );
    if (filterDateTo)
      filtered = filtered.filter(
        (a) => new Date(a.created_at) <= new Date(`${filterDateTo}T23:59:59`)
      );
    if (filterStatus) filtered = filtered.filter((a) => a.status === filterStatus);
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((a) =>
        Object.values(a)
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    setActivities(filtered);
  }, [rawActivities, filterDateFrom, filterDateTo, filterStatus, searchKeyword]);

  // Reset current page jika activities berubah (filter/search)
  useEffect(() => {
    setCurrentPage(1);
  }, [activities]);

  // Pagination slice
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const pagedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle edit
  const handleEdit = (activity: Activity) => {
    if (activity.status === 'Completed') return;
    setFormData({
      activity_name: activity.activity_name,
      location: activity.location,
      user: activity.user,
      it: activity.it,
      type: activity.type,
      category: activity.category,
      remarks: activity.remarks,
      status: activity.status,
      duration: activity.duration ?? '',
      updated_at: activity.updated_at ?? '',
    });
    setEditingId(activity.id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (activity: Activity) => {
    if (role !== 'admin') {
      alert('You do not have permission to delete activities.');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${activity.activity_name}"?`)) return;

    try {
      const { error } = await supabase.from('activities').delete().eq('id', activity.id);
      if (error) throw error;
      alert('Activity deleted successfully.');
    } catch (error) {
      alert('Failed to delete activity: ' + (error as Error).message);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedData: Partial<FormData> = { ...formData };

    if (formData.status === 'Completed') {
      const nowIso = new Date().toISOString();
      updatedData.updated_at = nowIso;

      if (editingId) {
        const existing = rawActivities.find((a) => a.id === editingId);
        if (existing) {
          const start = new Date(existing.created_at);
          const end = new Date(nowIso);
          const diffMs = end.getTime() - start.getTime();
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          updatedData.duration = `${hours}h ${minutes}m`;
        }
      }
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('activities')
          .update(updatedData)
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        // Buang properti kosong supaya tidak error insert
        const cleanedData = Object.fromEntries(
          Object.entries(updatedData).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );
        const { error } = await supabase.from('activities').insert([cleanedData]);
        if (error) throw error;
      }
      setFormData(initialForm);
      setShowForm(false);
    } catch (error) {
      alert('Failed to save activity: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">IT Activity Log</h1>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search activity..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="border px-3 py-1 rounded w-full md:w-52 text-sm"
          />

          {/* Toggle Filter */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 border text-sm"
            aria-label={showFilters ? 'Close filter panel' : 'Open filter panel'}
          >
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            {showFilters ? 'Close Filter' : 'Filter'}
          </button>

          {/* Export Buttons */}
          <ExportButtons activities={activities} />

          {/* Add Activity */}
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ ...initialForm, it: userIt });
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow text-sm"
            aria-label="Add new activity"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 border rounded-md shadow bg-white space-y-2">
          <div className="flex flex-wrap gap-4">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border p-2 rounded"
              aria-label="Filter from date"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border p-2 rounded"
              aria-label="Filter to date"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border p-2 rounded"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="On Progress">On Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ActivityForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
            setFormData(initialForm);
          }}
          loading={loading}
          editingId={editingId}
          userIt={userIt}
        />
      )}

      {/* Activity Table */}
      <ActivityTable
        activities={pagedActivities}
        role={role}
        onEdit={handleEdit}
        onView={(activity) => setViewingActivity(activity)}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Detail Modal */}
      {viewingActivity && (
        <ActivityDetailModal activity={viewingActivity} onClose={() => setViewingActivity(null)} />
      )}
    </div>
  );
}
