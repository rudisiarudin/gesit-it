// components/ActivityLog/ActivityForm.tsx
'use client';

import React from 'react';

export type FormData = {
  activity_name: string;
  location: string;
  user: string;
  it: string;
  type: string;
  category: string;
  remarks: string;
  status: string;
  duration?: string;
  updated_at?: string;
  created_at?: string; // ✅ Tambahkan ini (opsional)
};



type Props = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  editingId: number | null;
  onCancel: () => void;
};

export default function ActivityForm({
  formData,
  setFormData,
  handleSubmit,
  loading,
  editingId,
  onCancel,
}: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <h2 className="text-lg font-semibold mb-2">
        {editingId ? 'Edit Activity' : 'New Activity'}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: 'Activity Name', name: 'activity_name' },
          { label: 'Location', name: 'location' },
          { label: 'User', name: 'user' },
          {
            label: 'IT',
            name: 'it',
            type: 'select',
            options: ['Bendry', 'Rudi'],
          },
          {
            label: 'Type',
            name: 'type',
            type: 'select',
            options: ['Minor', 'Major'],
          },
          {
            label: 'Category',
            name: 'category',
            type: 'select',
            options: [
              'Network',
              'Hardware',
              'Software',
              'Printer',
              'Email',
              'Access Request',
              'Troubleshooting',
              'Other',
            ],
          },
        ].map(({ label, name, type, options }) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            {type === 'select' ? (
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
                value={formData[name as keyof FormData] as string}
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
              <input
                name="duration"
                value={formData.duration || ''}
                readOnly
                className="input bg-gray-100 cursor-not-allowed"
              />
            </div>
            {formData.updated_at && (
              <div>
                <label className="block text-sm font-medium mb-1">Updated At</label>
                <input
                  value={new Date(formData.updated_at).toLocaleString()}
                  readOnly
                  className="input bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2">
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
          onClick={onCancel}
          className="py-2 px-4 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
