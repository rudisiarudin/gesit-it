'use client';

import { useEffect, useState } from 'react';
import { Activity } from '@/types/activity';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Activity>, isEdit: boolean, id?: number) => void;
  editingData: Activity | null;
};

export default function ActivityModal({ open, onClose, onSave, editingData }: Props) {
  const [formData, setFormData] = useState<Partial<Activity>>({
    activity_name: '',
    user: '',
    it: '',
    status: '',
    created_at: '',
  });

  useEffect(() => {
    if (editingData) {
      setFormData(editingData);
    } else {
      setFormData({
        activity_name: '',
        user: '',
        it: '',
        status: '',
        created_at: new Date().toISOString().slice(0, 16),
      });
    }
  }, [editingData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (formData.activity_name && formData.user && formData.it && formData.status) {
      onSave(formData, !!editingData, editingData?.id);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Replaced Overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="bg-white p-6 rounded-xl shadow-xl z-10 max-w-md w-full relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">
            <X />
          </button>

          <Dialog.Title className="text-lg font-semibold mb-4">
            {editingData ? 'Edit Activity' : 'Add Activity'}
          </Dialog.Title>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Activity Name</label>
              <input
                type="text"
                name="activity_name"
                value={formData.activity_name || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">User</label>
              <input
                type="text"
                name="user"
                value={formData.user || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">IT</label>
              <select
                name="it"
                value={formData.it || ''}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select IT</option>
                <option value="Bendry">Bendry</option>
                <option value="Rudi">Rudi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select status</option>
                <option value="Pending">Pending</option>
                <option value="On Progress">On Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Created At</label>
              <input
                type="datetime-local"
                name="created_at"
                value={formData.created_at?.slice(0, 16) || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingData ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
