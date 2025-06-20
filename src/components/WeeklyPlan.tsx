'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Plan {
  id: number;
  title: string;
  week: string;
  month: string;
  year: string;
  status: string;
  user_id?: string;
}

export default function WeeklyPlan() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Plan, 'id'>>({
    title: '',
    week: '',
    month: '',
    year: '',
    status: '',
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        const uid = session.user.id;
        setUserId(uid);
        fetchPlans(uid);

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', uid)
          .single();

        if (!error && profile) {
          setRole(profile.role.toLowerCase());
        }
      }
    };

    checkSession();
  }, []);

  const fetchPlans = async (uid: string) => {
    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', uid)
      .order('id', { ascending: true });

    if (!error && data) setPlans(data);
  };

  const handleSubmit = async () => {
    if (!userId || role === 'user') return;

    if (isEditing && editId !== null) {
      const { error } = await supabase
        .from('weekly_plans')
        .update({ ...form })
        .eq('id', editId);

      if (error) console.error('Error updating plan:', error);
    } else {
      const { error } = await supabase.from('weekly_plans').insert([
        {
          ...form,
          user_id: userId,
        },
      ]);

      if (error) console.error('Error adding plan:', error);
    }

    setForm({ title: '', week: '', month: '', year: '', status: '' });
    setIsOpen(false);
    setIsEditing(false);
    setEditId(null);
    fetchPlans(userId);
  };

  const handleEdit = (plan: Plan) => {
    if (role === 'user') return;

    setForm({
      title: plan.title,
      week: plan.week,
      month: plan.month,
      year: plan.year,
      status: plan.status,
    });
    setEditId(plan.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (role !== 'admin') return;

    const confirmed = confirm('Are you sure you want to delete this plan?');
    if (!confirmed) return;

    const { error } = await supabase.from('weekly_plans').delete().eq('id', id);
    if (!error && userId) fetchPlans(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weekly Plan</h1>
        {(role === 'admin' || role === 'staff') && (
          <button
            onClick={() => {
              setForm({ title: '', week: '', month: '', year: '', status: '' });
              setIsEditing(false);
              setEditId(null);
              setIsOpen(true);
            }}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <PlusCircle className="mr-2" size={18} /> Add Weekly Plan
          </button>
        )}
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">No</th>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Week</th>
            <th className="text-left p-3">Month</th>
            <th className="text-left p-3">Year</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, idx) => (
            <tr key={plan.id} className="border-t">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">{plan.title}</td>
              <td className="p-3">{plan.week}</td>
              <td className="p-3">{plan.month}</td>
              <td className="p-3">{plan.year}</td>
              <td className="p-3">{plan.status}</td>
              <td className="p-3 flex gap-2">
                {(role === 'admin' || role === 'staff') && (
                  <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:underline">
                    <Pencil size={16} />
                  </button>
                )}
                {role === 'admin' && (
                  <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:underline">
                    <Trash2 size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white w-full max-w-md p-6 rounded shadow">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {isEditing ? 'Edit Weekly Plan' : 'Add Weekly Plan'}
            </Dialog.Title>
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-2 rounded" />

              <select value={form.week}
                onChange={(e) => setForm({ ...form, week: e.target.value })}
                className="w-full border p-2 rounded">
                <option value="">Select Week</option>
                <option value="Week 1">Week 1</option>
                <option value="Week 2">Week 2</option>
                <option value="Week 3">Week 3</option>
                <option value="Week 4">Week 4</option>
              </select>

              <input type="text" placeholder="Month" value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full border p-2 rounded" />

              <input type="text" placeholder="Year" value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full border p-2 rounded" />

              <input type="text" placeholder="Status" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border p-2 rounded" />

              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm">
                  Cancel
                </button>
                {(role === 'admin' || role === 'staff') && (
                  <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {isEditing ? 'Update' : 'Add'}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
