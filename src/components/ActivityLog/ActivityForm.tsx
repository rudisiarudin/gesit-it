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
    // IT is readonly, prevent changes
    if (e.target.name === 'it') return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Responsive layout:
  // Mobile: all fields stacked vertically
  // Desktop (md+): 2-column grid for inputs, textarea full width
  
  return (
    <Dialog open={true} onClose={onCancel} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-auto">
          <Dialog.Title className="text-lg font-bold mb-6 text-center sm:text-left">
            {editingId ? 'Edit Activity' : 'New Activity'}
          </Dialog.Title>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[{ label: 'Activity Name', name: 'activity_name' },
                { label: 'Location', name: 'location' },
                { label: 'User', name: 'user' },
                // IT is readonly
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
                  <div key={name} className="flex flex-col">
                    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    {name === 'it' ? (
                      <input
                        id={name}
                        name="it"
                        value={userIt}
                        readOnly
                        className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    ) : type === 'select' ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name as keyof FormData] || ''}
                        onChange={handleChange}
                        required
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        id={name}
                        name={name}
                        type="text"
                        value={formData[name as keyof FormData] || ''}
                        onChange={handleChange}
                        required
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
            </div>

            <div className="flex flex-col">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks || ''}
                onChange={handleChange}
                rows={3}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'Pending'}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="On Progress">On Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {editingId && (
                <>
                  <div className="flex flex-col">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      id="duration"
                      name="duration"
                      value={formData.duration || ''}
                      readOnly
                      className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {formData.updated_at && (
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Updated At
                      </label>
                      <input
                        value={new Date(formData.updated_at).toLocaleString()}
                        readOnly
                        className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                className="inline-flex items-center justify-center rounded-md bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
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
