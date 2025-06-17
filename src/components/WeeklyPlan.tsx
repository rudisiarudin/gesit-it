"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { PlusCircle } from "lucide-react";

interface Plan {
  id: number;
  title: string;
  week: string;
  status: string;
}

const initialData: Plan[] = [
  {
    id: 1,
    title: "Replace SSD FA",
    week: "Week 4 Jun",
    status: "Lisi hold 26 Jun",
  },
  {
    id: 2,
    title: "Housekeeping Server DSM",
    week: "Week 3 Jun",
    status: "Disk 2 on process",
  },
  {
    id: 3,
    title: "Delete Email heri@aams.co.id 20/6/2025",
    week: "Week 3 Jun",
    status: "Cooldown time deletion",
  },
  {
    id: 4,
    title: "Creating Purchase Coax Cable, lakban hitam, Backup IP Cam + Sd card",
    week: "Week 3 Jun",
    status: "Creating Form",
  },
  {
    id: 5,
    title: "Creating comparison data Mikrotik",
    week: "Week 3 Jun",
    status: "Creating File",
  },
  {
    id: 6,
    title: "Comparison Teams Essentials for user (Pak Jacob and Pak Javier request)",
    week: "Week 3 Jun",
    status: "Creating File",
  },
];

export default function WeeklyPlan() {
  const [plans, setPlans] = useState<Plan[]>(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Omit<Plan, "id">>({ title: "", week: "", status: "" });

  const addPlan = () => {
    setPlans((prev) => [...prev, { id: prev.length + 1, ...form }]);
    setForm({ title: "", week: "", status: "" });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weekly Plan</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <PlusCircle className="mr-2" size={18} /> Add Weekly Plan
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">No</th>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Week</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, idx) => (
            <tr key={plan.id} className="border-t">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3">{plan.title}</td>
              <td className="p-3">{plan.week}</td>
              <td className="p-3">{plan.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white w-full max-w-md p-6 rounded shadow">
            <Dialog.Title className="text-lg font-semibold mb-4">Add Weekly Plan</Dialog.Title>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Week"
                value={form.week}
                onChange={(e) => setForm({ ...form, week: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm">Cancel</button>
                <button
                  onClick={addPlan}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
