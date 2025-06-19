'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface PurchasePlan {
  id: number;
  item_name: string;
  qty: number;
  unit: string;
  needed_by: string;
  status: string;
  remarks: string;
  estimated_price: number;
  user_id?: string;
}

export default function PurchasePlanPage() {
  const [plans, setPlans] = useState<PurchasePlan[]>([]);
  const [form, setForm] = useState<Omit<PurchasePlan, 'id'>>({
    item_name: '',
    qty: 1,
    unit: '',
    needed_by: '',
    status: '',
    remarks: '',
    estimated_price: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        setUserId(session.user.id);
        fetchPlans(session.user.id);
      }
    };
    checkSession();
  }, []);

  const fetchPlans = async (uid: string) => {
    const { data, error } = await supabase
      .from('purchase_plans')
      .select('*')
      .eq('user_id', uid)
      .order('id', { ascending: true });

    if (!error && data) setPlans(data);
  };

  const handleSubmit = async () => {
    if (!userId) return;

    const payload = {
      ...form,
      qty: Number(form.qty),
      estimated_price: Number(form.estimated_price),
      user_id: userId,
    };

    if (editId !== null) {
      await supabase.from('purchase_plans').update(payload).eq('id', editId);
    } else {
      await supabase.from('purchase_plans').insert([payload]);
    }

    setForm({ item_name: '', qty: 1, unit: '', needed_by: '', status: '', remarks: '', estimated_price: 0 });
    setIsOpen(false);
    setEditId(null);
    fetchPlans(userId);
  };

  const handleDelete = async (id: number) => {
    await supabase.from('purchase_plans').delete().eq('id', id);
    if (userId) fetchPlans(userId);
  };

  const handleEdit = (plan: PurchasePlan) => {
    setForm({
      item_name: plan.item_name,
      qty: plan.qty,
      unit: plan.unit,
      needed_by: plan.needed_by,
      status: plan.status,
      remarks: plan.remarks,
      estimated_price: plan.estimated_price,
    });
    setEditId(plan.id);
    setIsOpen(true);
  };

  const formatCurrency = (value: number) =>
    'Rp ' + value.toLocaleString('id-ID');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Plan</h1>
        <button
          onClick={() => {
            setIsOpen(true);
            setEditId(null);
            setForm({ item_name: '', qty: 1, unit: '', needed_by: '', status: '', remarks: '', estimated_price: 0 });
          }}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <PlusCircle className="mr-2" size={18} /> Add Purchase
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">No</th>
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-left">Qty</th>
            <th className="p-3 text-left">Satuan</th>
            <th className="p-3 text-left">Needed By</th>
            <th className="p-3 text-left">Est. Harga</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Remarks</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, idx) => (
            <tr key={plan.id} className="border-t">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">{plan.item_name}</td>
              <td className="p-3">{plan.qty}</td>
              <td className="p-3">{plan.unit}</td>
              <td className="p-3">{plan.needed_by}</td>
              <td className="p-3">{formatCurrency(plan.estimated_price)}</td>
              <td className="p-3">{formatCurrency(plan.estimated_price * plan.qty)}</td>
              <td className="p-3">{plan.status}</td>
              <td className="p-3">{plan.remarks}</td>
              <td className="p-3 flex gap-2">
                <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:underline">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:underline">
                  <Trash2 size={16} />
                </button>
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
              {editId ? 'Edit' : 'Add'} Purchase Plan
            </Dialog.Title>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Item Name"
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Qty"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Satuan"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="date"
                value={form.needed_by}
                onChange={(e) => setForm({ ...form, needed_by: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Estimasi Harga"
                value={form.estimated_price}
                onChange={(e) => setForm({ ...form, estimated_price: Number(e.target.value) })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Remarks"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
