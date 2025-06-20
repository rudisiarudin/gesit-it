'use client';

import { Dialog } from '@headlessui/react';
import { useRef } from 'react';
import { FormData } from '@/components/ActivityLog/types';

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  editingId: number | null;
  userIt: string; // user login name passed from parent
};

export default function ActivityForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  editingId,
  userIt,
}: Props) {
  const cancelButtonRef = useRef(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    // IT readonly, jadi kalau user coba ubah it tidak diizinkan
    if (e.target.name === 'it') return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={true} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold mb-4">
            {editingId ? 'Edit Activity' : 'New Activity'}
          </Dialog.Title>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {[{ label: 'Activity Name', name: 'activity_name' },
                { label: 'Location', name: 'location' },
                { label: 'User', name: 'user' },
                // Ganti IT jadi readonly input dari userIt
                { label: 'IT', name: 'it', readonly: true },
                { label: 'Type', name: 'type', type: 'select', options: ['Minor', 'Major'] },
                {
                  label: 'Category',
                  name: 'category',
                  type: 'select',
                  options: [
                    'Network', 'Hardware', 'Software',
                    'Printer', 'Email', 'Access Request',
                    'Troubleshooting', 'Other'
                  ],
                }].map(({ label, name, type, options, readonly }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    {name === 'it' ? (
                      <input
                        name="it"
                        value={userIt}
                        readOnly
                        className="input bg-gray-100 cursor-not-allowed"
                      />
                    ) : type === 'select' ? (
                      <select
                        name={name}
                        value={formData[name as keyof FormData]}
                        onChange={handleChange}
                        className="input"
                        required
                      >
                        <option value="">Select {label}</option>
                        {options!.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={name}
                        value={formData[name as keyof FormData]}
                        onChange={handleChange}
                        className="input"
                        required
                      />
                    )}
                  </div>
                ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="input"
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input name="duration" value={formData.duration} readOnly className="input" />
                  </div>
                  {formData.updated_at && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Updated At</label>
                      <input
                        value={new Date(formData.updated_at).toLocaleString()}
                        readOnly
                        className="input"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {loading
                  ? 'Saving...'
                  : editingId
                  ? 'Update Activity'
                  : 'Submit Activity'}
              </button>
              <button
                type="button"
                ref={cancelButtonRef}
                onClick={onCancel}
                className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
